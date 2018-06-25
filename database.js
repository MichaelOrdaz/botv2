var mysql = require('mysql')
module.exports = class DB{

	start(){
		this.conn = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'botv2'
		});
	}
	//querys tipo insert,update, delete
	setQuery(type, sql, data){
		//si vamos a insertar primero hacemos un select, de ahi si es 0 resultados, hacemos un insert si hay resultados hacemos un update
		
	}
	//querys select
	getQuery(sql, callback){
		this.conn.connect( err => {
			if(err) throw err;
			console.log('conectado');
			this.conn.query(sql, (err, result, fields) => {
				if(err) throw err;
				callback(result);
			});
		});
	}
}

/*
create database botv2;
use botv2;
create table locationuser(
	psid varchar(30) not null unique,
    ubicacion varchar(100) not null,
    tiempo varchar(30) default 0
)ENGINE=INNODB, charset=utf8;
*/