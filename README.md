# ChatUI

(React Typescript+ExpressJS)

Run this command to initialize.

```
npm install
```

Run this command to start both React frontend and the ExpressJS backend in the devevlopment/production mode.

```
npm start # start the server in the development mode.

npm run start:prod # start the server in the production mode.
```

Now the lint checking is supported to coerce the code standard to be conformed.

## VS Extensions

Please add these extensions if you are using vs code for editing.

- ESLint
- Prettier - Code formatter

Recommended settings:
Go to extension settings, and use searchbar to enable the following settings:

- Prettier:Semi
- Editor:Format On Save

## NOTE

There might be some conflicts in the node module. If you encounter these issues, please delete all your existing node*modules folders and use \_npm install* to install all the dependencies.

## DATABASE
host: database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com:5432

username: postgres

password: talk2data

database: postgres

### Connecting with psql

Set password (optional, but will have to enter password everytime you would like to connect with psql):
```
export PGPASSWORD=talk2data
```

Execute sql commands:
```
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f example.sql
```

### TABLES
- demo_databases
List all the databases currently
- perpertrator
{database_name, table_name, user_id}, ....
