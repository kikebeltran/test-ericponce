#!/bin/bash

STAGE='prod'

PS3='Select stage to deploy: '
options=('prod' 'stg')
select opt in "${options[@]}"
do
    case $opt in
        'prod')
            break
            ;;
        'stg')
            STAGE='stg'
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done

echo '# Building'
npm run build

echo '# Deploying'
AWS_DEFAULT_REGION=eu-south-2 serverless deploy --stage $STAGE
