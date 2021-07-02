import json
import logging

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def post_to_connection(domain_name, connection_id, body):
    client = boto3.client('apigatewaymanagementapi', endpoint_url=f"https://{domain_name}/ws")
    logger.info(f"Posting to connection: {json.dumps(body)}")
    client.post_to_connection(Data=json.dumps(body).encode(), ConnectionId=connection_id)