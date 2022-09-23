sudo -u postgres createdb waiters;

sudo -u postgres createuser kamvest -P;

password kv112;

create table workers(
	id serial not null primary key,
    username text not null

)

create table workdays(
	id serial not null primary key,
    workday text not null
)

create table boss(
    id serial not null primary key,
    

)