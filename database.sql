sudo -u postgres createdb waiters;

sudo -u postgres createuser kamvest -P;

password kv112;

create table workers(
	id serial not null primary key,
    username varchar(15) not null
);

create table workdays(
	id serial not null primary key,
    workday varchar(15) not null
);

create table boss(
    id serial not null primary key,
    employee int not null,
    day int not null,
    FOREIGN KEY (employee) references workers(id),
    FOREIGN KEY (day) references workdays(id)

);

INSERT INTO workdays(workday) values ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday'), ('Sunday');