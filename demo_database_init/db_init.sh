export PGPASSWORD=talk2data
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f begin_transaction.sql
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f demo_tables.sql
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f perpetrator.sql
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f covid.sql
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f college.sql
psql -h database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com -p 5432 -d postgres -U postgres -q -f end_transaction.sql