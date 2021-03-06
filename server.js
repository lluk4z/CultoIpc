const express = require("express");
const server = express();
const nodemailer = require("nodemailer");

// Arquivos estáticos no servidor
server.use(express.static('public'));

// habilitar body do formulario
server.use(express.urlencoded({ extended:true }));

// configurar a conexao com o banco de dados
const Pool = require('pg').Pool;
const db = new Pool({
	/*
	user: 'postgres',
	password: '0000',
	host: 'localhost',
	port: 5433,
	database: 'culto'
	*/
	user: 'kfcwudeqzwwmot',
	password: 'f7a44154bb6d7c9663357b4a2dcdfd69c0bd419be6a1f0949bc42485d61a6b1d',
	host: 'ec2-34-224-229-81.compute-1.amazonaws.com',
	port: 5432,
	database: 'd7mrie8oqt1gtu'
});

// Configurando a template engine
const nunjucks = require("nunjucks");
nunjucks.configure("./", {
	express: server,
	noCache: true,
});

// Banco de dados
var cont01 = 0;
var cont02 = 0;
var cont03 = 0;


var cont04 = 0;

//Testar CPF

function TestaCPF(strCPF) {
	var Soma;
	var Resto;
	Soma = 0;
if (strCPF == "00000000000") return false;
	 
for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
Resto = (Soma * 10) % 11;
 
	if ((Resto == 10) || (Resto == 11))  Resto = 0;
	if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
 
Soma = 0;
	for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
	Resto = (Soma * 10) % 11;
 
	if ((Resto == 10) || (Resto == 11))  Resto = 0;
	if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
	return true;
}

//================

// Função para validar o telefone


//================================


// Apresentação da página
server.get("/", function(req, res){
	db.query("SELECT * FROM pessoa WHERE hora = '09h'", function(err, result){
		if(err) return res.send("ERRO!")
		var cnt01 = result.rowCount;

	db.query("SELECT * FROM pessoa WHERE hora = '17h'", function(err, result){
		if(err) return res.send("ERRO!!")
		var cnt02 = result.rowCount;
			
			return res.render("index.html", { cnt01, cnt02 });
	});
	});
	
});

server.get("/BancoDedados", function(req, res){
	db.query("SELECT * FROM pessoa ORDER BY name", function(err, result){
		if(err) return res.send("Erro de banco de dados.")

		const pessoa = result.rows

		return res.render("dados.html", { pessoa });
	});
	
});

// Segunda feira

server.get("/CultoSegunda", function(req, res){

	db.query("SELECT * FROM segunda", function(err, result){
		if(err) return res.send("ERRO!!!")
		var qtd = result.rowCount;

		/*
		if(qtd >= 44){
			return res.render("HORARIO CHEIO!!!");
		}
		*/

		return res.render("CultoSegunda.html", { qtd });
	});
	
});


server.get("/CultoSegundaBD", function(req, res){
	db.query("SELECT * FROM segunda ORDER BY nome", function(err, result){
		if(err) return res.send("Erro de banco de dados.")

		const segunda = result.rows

		return res.render("CultoSegundaBD.html", { segunda });
	});
	
});

// PLANO B

server.get("/CultoPlanoB", function(req, res){

	db.query("SELECT * FROM planob", function(err, result){
		if(err) return res.send("ERRO!!!")
		var qtdPB = result.rowCount;

		return res.render("CultoPlanoB.html", { qtdPB });
	});
	
});

server.get("/PlanoBBD", function(req, res){
	db.query("SELECT * FROM planob", function(err, result){
		if(err) return res.send("Erro de banco de dados.")

		const planob = result.rows

		return res.render("PlanoBBD.html", { planob });
	});
	
});

//Confirma

server.get("/CultoPlanoB/confirma", function(req, res){

		return res.render("telaConfirma.html");
		
});

//================================================

server.post("/", function(req, res){
	//pegar dados do formulário
	const name = req.body.name
	const cpf = req.body.cpf
	const hora = req.body.hora
	const email = req.body.email

	if(name == "" || cpf == "" || hora == ""){
		return res.send("Todos os campos são obrigatórios.");
	}

	if(hora=="09h" && TestaCPF(cpf) && name != "" && cpf != "" && hora !="" && cont01 < 50){
		cont01++;
	}

	if(hora=="17h" && TestaCPF(cpf) && name != "" && cpf != "" && hora !="" && cont02 < 50){
		cont02++;
	}

	/*
	if(hora=="19h" && TestaCPF(cpf) && name != "" && cpf != "" && hora !="" && cont03 < 50){
		cont03++;
	}
	*/

	/*
	if(cont01 >= 6 || cont02 >= 25 || cont03 >= 0){

		if(cont02 >= 25){
			cont02 = cont02-1;
		}
		if(cont01 >= 6){
			cont01 = cont01 -1;
		}
		return res.send("O horário está cheio!");
		
	}
*/
	if(cont01 >= 50 && hora == '09h'){
		//cont01 = cont01 - 1;
		return res.send("O horário está cheio!");
	}

	if(cont02 >= 50 && hora == '17h'){
		//cont02 = cont02 - 1;
		return res.send("O horário está cheio!");
	}

	/*
	if( hora == '19h' && cont03 >= 0){
		//cont03 = cont03 - 1;
		return res.send("O horário está cheio!");
	}
	*/
	
	if(!TestaCPF(cpf)){
		return res.send("Informe um CPF válido!");
	}

	// Mandar email
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'culto.ipc@gmail.com',
			pass: 'CultoIPC890'
		}
	});

	transporter.sendMail({
		from: "IPCandeias <culto.ipc@gmail.com>",
		to: email,
		subject: "Sua vaga para o culto foi confirmada!",
		text: "Sua vaga está guardada. Obrigado pela presença. Apresente esse e-mail quando for ao culto. Até lá."
	}).then(message => {
		console.log(message);
	}).catch(err => {
		console.log(err);
	});
	

	console.log(cont01);
	console.log(cont02);
	//console.log(cont03);
	


	// colocar valores dentro do banco de dados
	const query = `INSERT INTO pessoa("name", "cpf", "hora")
								 VALUES ($1, $2, $3)`

	const values = [name, cpf, hora];

	db.query(query, values, function(err){
		//fluxo de erro
		if(err){
			if(hora == "09h"){
				cont01 = cont01-1;
			}
			if(hora == "17h"){
				cont02 = cont02-1;
			}
			
			return res.send("Erro no banco de dados. Talvez o CPF já tenha sido cadadstrado.")
		} 
		//fluxo ideal
		return res.redirect("/");
	});

});

//============ Rota do Culto da Segunda ================

server.post("/CultoSegunda", function(req, res){
	//pegar dados do formulário
	const nome = req.body.nome
	const cpfSegunda = req.body.cpfSegunda
	

	if(nome == "" || cpfSegunda == "" ){
		return res.send("Todos os campos são obrigatórios.");

	} 
	/*
	else if(cpfSegunda != "" && TestaCPF(cpfSegunda) && nome !=""){
		cont04++;
	}
*/
	
	if(cont04 >= 0){
		
		return res.send("O horário está cheio!");
		
	}




	if(!TestaCPF(cpfSegunda)){
		return res.send("Informe um CPF válido!");
	}

	
/*	
	exports.countElements = (req, res, next) => {
    const sql = 'SELECT * FROM segunda';
    postgres.query(sql, (err, result) => {
        if (err) {
            return res.send("HOUVE UM ERRO")
        }
        if (result.rows.length >= 44) {
            return res.send("O HORARIO ESTÁ CHEIO");
        }
        //...fazer suas coisas...
        next();
    });
};
*/	

	//console.log(cont01);
	//console.log(cont02);
	//console.log(cont03);


	// colocar valores dentro do banco de dados
	const query = `INSERT INTO segunda("nome", "cpfSegunda")
								 VALUES ($1, $2)`

	const values = [nome, cpfSegunda];

	db.query(query, values, function(err){
		//fluxo de erro
		if(err){
			//cont04 = cont04-1;
			return res.send("Erro no banco de dados. Talvez o CPF já tenha sido cadadstrado.")
		} 
		//fluxo ideal
		return res.redirect("/CultoSegunda");
	});


});


//===== ROTA DO PLANO B ===============

server.post("/CultoPlanoB", function(req, res){
	//pegar dados do formulário
	const nomePB = req.body.nomePB
	const cpfPB = req.body.cpfPB
	const fone = req.body.fone
	

	if(nomePB == "" || cpfPB == "" || fone == ""){
		return res.send("Todos os campos são obrigatórios.");

	} 


	if(!TestaCPF(cpfPB)){
		return res.send("Informe um CPF válido!");
	}
	

	// colocar valores dentro do banco de dados
	const query = `INSERT INTO planob("nomePB", "cpfPB", "fone")
								 VALUES ($1, $2, $3)`

	const values = [nomePB, cpfPB, fone];

	db.query(query, values, function(err){
		//fluxo de erro
		if(err){
			//cont04 = cont04-1;
			return res.send("Erro no banco de dados. Talvez o CPF já tenha sido cadadstrado.")
		} 
		//fluxo ideal
		return res.redirect("/CultoPlanoB/confirma");
	});


});


//====================================


// Permitir acesso a porta 3000
server.listen(3000, function(){
	console.log("iniciei o servidor");
});

server.listen(process.env.PORT || 3000);