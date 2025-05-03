mod add;
mod update;

use std::{env, time::Duration};

use clap::{Parser, Subcommand};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;

use add::add_feeds;
use update::{Hour, scheldule_updates, update_feeds};

const CONCURRENCY: usize = 10;

#[derive(Parser)]
#[command()]
struct Args {
    #[command(subcommand)]
    cmd: Command,
}

#[derive(Subcommand, Debug, Clone)]
enum Command {
    Add {
        url_opt: Option<String>,
    },
    Update {
        #[arg(
            short = 's',
            long = "schedule", 
            help = "Schedule updates for <hour> o'clock UTC",
            value_parser = Hour::parse
        )]
        schedule_hour_opt: Option<Hour>,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    log4rs::init_file("config/log4rs.yaml", Default::default()).unwrap();

    async {
        dotenv().ok();
        let host = env::var("DB_HOST")?;
        let user = env::var("DB_USER")?;
        let password = env::var("DB_PASSWORD")?;
        let name = env::var("DB_NAME")?;

        let pool = PgPoolOptions::new()
            .max_connections(CONCURRENCY as u32)
            .connect(&format!("postgres://{user}:{password}@{host}/{name}"))
            .await?;

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(20))
            .build()?;

        let args = Args::parse();
        match args.cmd {
            Command::Update { schedule_hour_opt } => {
                if let Some(schedule_hour) = schedule_hour_opt {
                    scheldule_updates(schedule_hour, CONCURRENCY, pool, client).await?;
                } else {
                    update_feeds(CONCURRENCY, pool, client).await?;
                }
            }
            Command::Add { url_opt } => {
                add_feeds(pool, client, url_opt).await?;
            }
        }
        Ok::<(), anyhow::Error>(())
    }
    .await
    .inspect_err(|e| {
        log::error!("{}", e);
    })
}
