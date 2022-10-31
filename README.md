# waiters-week
[![Node.js CI](https://github.com/Kamvandwanya7/waiters-week/actions/workflows/node.js.yml/badge.svg)](https://github.com/Kamvandwanya7/waiters-week/actions/workflows/node.js.yml)


name: Node.js CI

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
    
jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [12.x, 14.x, 16.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
    
    services:
      postgres:
        image: postgres:latest
        
        env:
          POSTGRES_DB: waiters_tests
          POSTGRES_PASSWORD: kv199
          POSTGRES_PORT: 5432
          POSTGRES_USER: kamveri
        ports:
          - 5432:5432
        
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      env:
        PGPASSWORD: postgres
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm install -g npm
    - run: npm install
    - run: |
        PGPASSWORD=kv199 psql -h localhost -U kamveri -d waiters_tests -a -f database.sql
    - run: npm run build --if-present
    - run: npm test
    env: 
      DATABASE_URL: postgresql://kamveri:kv199@localhost:5432/waiters_tests
