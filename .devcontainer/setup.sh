#!/usr/bin/env bash
set -e

echo "Installing RabbitMQ..."
sudo apt-get update
sudo apt-get install -y rabbitmq-server

echo "Starting RabbitMQ..."
sudo service rabbitmq-server start

echo "Enabling management plugin..."
sudo rabbitmq-plugins enable rabbitmq_management

echo "Waiting for RabbitMQ to be ready..."
sleep 5

echo "Creating admin user..."
sudo rabbitmqctl add_user admin adminpassword || true
sudo rabbitmqctl set_user_tags admin administrator || true
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*" || true

echo "RabbitMQ setup complete."