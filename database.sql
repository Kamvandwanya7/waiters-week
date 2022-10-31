sudo -u postgres createdb waiters;

sudo -u postgres createdb waiters_tests;


sudo -u postgres createuser kamvest -P;

password kv112;
kv199/119

create table workers(
	id serial not null primary key,
    username text not null,
    code varchar
);

create table workdays(
	id serial not null primary key,
    workday text not null
);

create table admins(
    id serial not null primary key,
    user_id integer,
    day_id integer


    FOREIGN KEY (user_id) references workers(id),
    FOREIGN KEY (day) references workdays(id)

);

INSERT INTO workdays(workday) values ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday'), ('Sunday');

INSERT INTO workers(username) values('kamva');


SELECT workers.code AS codes FROM workers JOIN admins ON admins.user_id = workers.id;

alter table admins  alter column user_id type integer;


 rename column employee to user_id integer;

UPDATE workers
SET worday = tuesday ...
WHERE code= 123;