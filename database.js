var mysql = require('mysql')
module.exports = class DB{

	start(){
		this.conn = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'test'
		});	
	}
	//querys tipo insert,update, delete
	setQuery(sql, data){
		//falta declararlo
	}
	//querys select
	getQuery(sql, data){
		this.conn.connect( err => {
			if(err) throw err;
			console.log('conectado');

			this.conn.query("SELECT * FROM promos", (err, result, fields) => {
				if(err) throw err;
				console.log(result);
				console.log("mi resultado particular: ", result[1].titulo);
			});
		});
	}
}