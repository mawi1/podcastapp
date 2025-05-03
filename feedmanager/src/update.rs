use std::{collections::HashSet, str::FromStr, sync::LazyLock, time::Duration};

use ammonia::{clean, is_html};
use anyhow::bail;
use chrono::{DateTime, Local, NaiveTime};
use futures::future;
use regex::Regex;
use reqwest::{Client, StatusCode, header::IF_NONE_MATCH};
use rss::{Channel, Item};
use serde::Serialize;
use sqlx::{Pool, Postgres};
use tokio::{
    select,
    signal::unix::{SignalKind, signal},
    time::sleep,
};
use xxhash_rust::xxh3::xxh3_64;

fn parse_duration(s: &str) -> Result<i32, ()> {
    static RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"^((?<hours>\d{1,2}):)?(?<minutes>\d{1,2}):(?<seconds>\d{1,2})$").unwrap()
    });
    match RE.captures(s) {
        Some(caps) => {
            let seconds = i32::from_str(&caps["seconds"]).unwrap();
            let minutes = i32::from_str(&caps["minutes"]).unwrap();
            if seconds > 59 || minutes > 59 {
                return Err(());
            }
            let hours = caps
                .name("hours")
                .map_or(0, |m| i32::from_str(m.as_str()).unwrap());

            Ok(hours * 3600 + minutes * 60 + seconds)
        }
        _ => match i32::from_str(s) {
            Ok(n) => {
                if n >= 0 {
                    Ok(n)
                } else {
                    Err(())
                }
            }
            Err(_) => Err(()),
        },
    }
}

fn htmlize(s: &str) -> String {
    let pre = s.trim().replace("&", "&amp;").replace("<", "&lt;");
    static LINEBREAKS_RE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(\r?\n){2,}").unwrap());
    let paragraphs = LINEBREAKS_RE
        .split(&pre)
        .map(|p| format!("<p>{}</p>", p))
        .collect::<String>();
    static SINGLE_LINEBREAK_RE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\r?\n").unwrap());
    SINGLE_LINEBREAK_RE
        .replace_all(&paragraphs, "<br>")
        .into_owned()
}

#[derive(Serialize)]
struct EpisodeHashData<'a> {
    title: Option<&'a str>,
    description: Option<&'a str>,
    url: Option<&'a str>,
    pub_date: Option<&'a str>,
}

fn calc_guid_hash(item: &Item) -> String {
    let e = EpisodeHashData {
        title: item.title.as_deref(),
        description: item.description.as_deref(),
        url: item.enclosure.as_ref().map(|e| e.url.as_str()),
        pub_date: item.pub_date.as_deref(),
    };
    let mut bytes: Vec<u8> = Vec::new();
    serde_json::to_writer(&mut bytes, &e).unwrap();
    format!("{:x}", xxh3_64(&bytes[..]))
}

async fn do_update_feeds(pool: Pool<Postgres>, client: Client) -> anyhow::Result<()> {
    loop {
        let mut tx = pool.begin().await?;
        let fetch_opt: Option<(i32, String, Option<Vec<u8>>)> = sqlx::query_as(
            "SELECT id, feed_url, http_etag FROM podcast \
            WHERE updated = false FOR UPDATE SKIP LOCKED LIMIT 1",
        )
        .fetch_optional(&mut *tx)
        .await?;
        let (podcast_id, feed_url, http_etag_opt) = match fetch_opt {
            Some(v) => v,
            None => {
                log::info!("No more podcasts to update");
                return Ok(());
            }
        };

        let mut http_request = client.get(&feed_url);
        if let Some(http_etag) = http_etag_opt {
            http_request = http_request.header(IF_NONE_MATCH, http_etag);
        }
        let http_response = match http_request.send().await {
            Ok(r) => r,
            Err(e) => {
                log::warn!("Could not send request: {}", e);
                continue;
            }
        };
        if http_response.status() == StatusCode::NOT_MODIFIED {
            log::info!("Podcast {} not modified", podcast_id);
            sqlx::query("UPDATE podcast SET updated = true WHERE id = $1")
                .bind(podcast_id)
                .execute(&mut *tx)
                .await?;
            tx.commit().await?;
            continue;
        } else if http_response.status() != StatusCode::OK {
            log::warn!(
                "Non 200 status code returned for {} : {}",
                feed_url,
                http_response.status().as_str()
            );
            continue;
        };
        let new_http_etag = http_response
            .headers()
            .get("ETag")
            .map(|e| Vec::from(e.as_bytes()));

        let now = Local::now().fixed_offset();
        let feed_xml = match http_response.bytes().await {
            Ok(b) => b,
            Err(e) => {
                log::warn!("Could not read response body for {} : {}", feed_url, e);
                continue;
            }
        };
        let channel = match Channel::read_from(&feed_xml[..]) {
            Ok(c) => c,
            Err(e) => {
                log::warn!("Could not read RSS feed for {} : {}", feed_url, e);
                continue;
            }
        };

        let existing_guids: HashSet<String> = HashSet::from_iter(
            sqlx::query_scalar::<_, String>("SELECT guid FROM episode WHERE podcast_id = $1")
                .bind(podcast_id)
                .fetch_all(&mut *tx)
                .await?,
        );
        for item in channel.items.into_iter().rev() {
            let guid = item
                .guid
                .as_ref()
                .map_or_else(|| calc_guid_hash(&item), |g| g.value.clone());
            if existing_guids.contains(&guid) {
                continue;
            }

            let title = item.title.as_deref();
            let content = item.content.as_deref().map(|c| clean(c)).or(item
                .description
                .as_deref()
                .map(|d| if is_html(d) { clean(d) } else { htmlize(d) }));
            let audio_url = item.enclosure.as_ref().map(|e| e.url.as_str());
            let pub_date = item.pub_date.as_deref().map_or(now, |s| {
                DateTime::parse_from_rfc2822(s).unwrap_or_else(|_| {
                    log::warn!("Podcast {}: couldn't parse pubDate", podcast_id);
                    now
                })
            });
            let duration = item
                .itunes_ext()
                .and_then(|i| i.duration())
                .and_then(|duration_str| match parse_duration(duration_str) {
                    Ok(d) => Some(d),
                    Err(_) => {
                        log::warn!("Podcast {}: couldn't parse duration", podcast_id);
                        None
                    }
                });

            sqlx::query("INSERT INTO episode (title, content, audio_url, pub_date, duration_seconds, guid, podcast_id)\
            VALUES ($1, $2, $3, $4, $5, $6, $7)")
            .bind(title)
            .bind(content)
            .bind(audio_url)
            .bind(pub_date)
            .bind(duration)
            .bind(guid)
            .bind(podcast_id)
            .execute(&mut *tx)
            .await?;
        }

        sqlx::query("UPDATE podcast SET updated = true, http_etag = $1 WHERE id = $2")
            .bind(new_http_etag)
            .bind(podcast_id)
            .execute(&mut *tx)
            .await?;
        tx.commit().await?;
    }
}

pub(crate) async fn update_feeds(
    concurrency: usize,
    pool: Pool<Postgres>,
    client: Client,
) -> anyhow::Result<()> {
    sqlx::query("UPDATE podcast SET updated = false")
        .execute(&pool)
        .await?;
    let mut handles = Vec::with_capacity(concurrency);
    for _ in 0..concurrency {
        handles.push(tokio::spawn(do_update_feeds(pool.clone(), client.clone())))
    }
    future::try_join_all(handles).await?;
    Ok(())
}

#[derive(Debug, Clone, Copy)]
pub(crate) struct Hour(u32);

impl Hour {
    pub(crate) fn parse(s: &str) -> Result<Self, String> {
        let h_num = s
            .parse::<u32>()
            .map_err(|_| format!("`{s}` is not a valid number"))?;
        if h_num > 23 {
            return Err("Hour must be <= 23".to_owned());
        }
        Ok(Self(h_num))
    }
}

pub(crate) async fn scheldule_updates(
    hour: Hour,
    concurrency: usize,
    pool: Pool<Postgres>,
    client: Client,
) -> anyhow::Result<()> {
    let scheduled_time = NaiveTime::from_hms_opt(hour.0, 0, 0).unwrap();
    let mut sig_int = signal(SignalKind::interrupt())?;
    let mut sig_term = signal(SignalKind::terminate())?;

    loop {
        let now = chrono::Utc::now().time();
        let delta = scheduled_time - now;
        let sleep_seconds = if delta.num_seconds() > 0 {
            delta.num_seconds() as u64
        } else {
            (86400 + delta.num_seconds()) as u64
        };

        select! {
            res = async {
                sleep(Duration::from_secs(sleep_seconds)).await;
                log::info!("Start updating");
                update_feeds(concurrency, pool.clone(), client.clone()).await
            } => {
                if let Err(e) = res {
                    bail!(e)
                }                
            },
            _ = sig_int.recv() => {
                log::info!("Received SIGINT");
                break;
            },
            _ = sig_term.recv() => {
                log::info!("Received SIGTERM");
                break;
            },
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pd_zero() {
        let res1 = parse_duration("0:0");
        assert!(res1.is_ok());
        assert_eq!(res1.unwrap(), 0);

        let res2 = parse_duration("00:00");
        assert!(res2.is_ok());
        assert_eq!(res2.unwrap(), 0);

        let res3 = parse_duration("00:0:00");
        assert!(res3.is_ok());
        assert_eq!(res3.unwrap(), 0);

        let res3 = parse_duration("0");
        assert!(res3.is_ok());
        assert_eq!(res3.unwrap(), 0);
    }

    #[test]
    fn test_pd_valid() {
        let res1 = parse_duration("10:23");
        assert!(res1.is_ok());
        assert_eq!(res1.unwrap(), 623);

        let res2 = parse_duration("11:05:34");
        assert!(res2.is_ok());
        assert_eq!(res2.unwrap(), 39934);

        let res3 = parse_duration("99:59:59");
        assert!(res3.is_ok());
        assert_eq!(res3.unwrap(), 359999);

        let res3 = parse_duration("52201");
        assert!(res3.is_ok());
        assert_eq!(res3.unwrap(), 52201);
    }

    #[test]
    fn test_pd_invalid() {
        let res1 = parse_duration("100:23");
        assert!(res1.is_err());

        let res2 = parse_duration("00:60");
        assert!(res2.is_err());

        let res2 = parse_duration("-567");
        assert!(res2.is_err());
    }
    
    #[test]
    fn test_htmlize_two_linebreaks() {
        let html = htmlize(
            "Lorem ipsum dolor sit amet\n\nconsetetur sadipscing elitr sed\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_three_linebreaks() {
        let html = htmlize(
            "Lorem ipsum dolor sit amet\n\n\nconsetetur sadipscing elitr sed\n\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_win_linebreaks() {
        let html = htmlize(
            "Lorem ipsum dolor sit amet\r\n\r\nconsetetur sadipscing elitr sed\r\n\r\n\r\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_single_linebreak() {
        let html = htmlize(
            "Lorem ipsum dolor sit amet\nconsetetur sadipscing elitr sed\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_single_win_linebreak() {
        let html = htmlize(
            "Lorem ipsum dolor sit amet\r\nconsetetur sadipscing elitr sed\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_lt_escape() {
        let html = htmlize(
            "Lorem ipsum dol<or sit amet\n\nconsetetur sadipscing elitr sed\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }

    #[test]
    fn test_htmlize_amp_escape() {
        let html = htmlize(
            "Lorem ipsum dol&or sit amet\n\nconsetetur sadipscing elitr sed\n\ndiam nonumy eirmod tempor invidunt ut labore",
        );
        insta::assert_yaml_snapshot!(html);
    }
}
