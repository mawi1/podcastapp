FROM rust:latest AS chef
RUN cargo install cargo-chef 
WORKDIR /feedmanager

FROM chef AS planner
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /feedmanager/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release

FROM ubuntu:latest
RUN apt-get update && apt-get install -y ca-certificates libssl-dev
RUN update-ca-certificates
WORKDIR /feedmanager
RUN mkdir log
COPY config ./config
COPY --from=builder /feedmanager/target/release/feedmanager .
ENTRYPOINT ["./feedmanager"]
