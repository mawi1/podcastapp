use reqwest::Client;
use rss::Channel;
use sqlx::{Pool, Postgres};
use tokio::io::{AsyncBufReadExt, BufReader, stdin};
use voca_rs::strip::strip_tags;

async fn add_feed(pool: &Pool<Postgres>, client: &Client, url: &str) -> anyhow::Result<()> {
    let feed_xml = client.get(url).send().await?.bytes().await?;
    let channel = Channel::read_from(&feed_xml[..])?;
    log::info!("Adding channel {}", &channel.title);

    sqlx::query(
        "INSERT INTO podcast (title, link, description, feed_url) VALUES ($1, $2, $3, $4)\
        ON CONFLICT ON CONSTRAINT podcast__feed_url__unique DO NOTHING",
    )
    .bind(channel.title.trim())
    .bind(channel.link.trim())
    .bind(strip_tags(channel.description.trim()))
    .bind(url)
    .execute(pool)
    .await?;
    Ok(())
}

pub(crate) async fn add_feeds(
    pool: Pool<Postgres>,
    client: Client,
    url_opt: Option<String>,
) -> anyhow::Result<()> {
    if let Some(url) = url_opt {
        add_feed(&pool, &client, &url).await?;
    } else {
        let mut lines = BufReader::new(stdin()).lines();
        while let Some(line) = lines.next_line().await? {
            if line.is_empty() || line.trim_start().starts_with("#") {
                continue;
            }
            if let Err(e) = add_feed(&pool, &client, &line).await  {
                log::error!("{}", e);
            };
        }
    }
    Ok(())
}
