const express = require("express");
const server = express();

// Arquivos estáticos no servidor
server.use(express.static('public'));

// habilitar body do formulario
server.use(express.urlencoded({ extended:true }));

// configurar a conexao com o banco de dados
const Pool = require('pg').Pool;
const db = new Pool({
	user: 'postgres',
	password: '0000',
	host: 'localhost',
	port: 5433,
	database: 'culto'
});

// Configurando a template engine
const nunjucks = require("nunjucks");
nunjucks.configure("./", {
	express: server,
	noCache: true,
});

// Banco de dados
cont01 = 0;
cont02 = 0;
cont03 = 0;

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


// Apresentação da página
server.get("/", function(req, res){
	return res.render("index.html", { cont01, cont02, cont03 });
});

server.get("/BancoDedados", function(req, res){
	db.query("SELECT * FROM pessoa ORDER BY name", function(err, result){
		if(err) return res.send("Erro de banco de dados.")

		const pessoa = result.rows

		return res.render("dados.html", { pessoa });
	});
	
});

server.post("/", function(req, res){
	//pegar dados do formulário
	const name = req.body.name
	const cpf = req.body.cpf
	const hora = req.body.hora

	if(name == "" || cpf == "" || hora == ""){
		return res.send("Todos os campos são obrigatórios.");
	}

	if(hora=="09h" && TestaCPF(cpf) && name != "" && cpf != "" && hora !=""){
		cont01++;
	}

	if(hora=="15h30" && TestaCPF(cpf) && name != "" && cpf != "" && hora !=""){
		cont02++;
	}

	if(hora=="19h30" && TestaCPF(cpf) && name != "" && cpf != "" && hora !=""){
		cont03++;
	}

	if(cont01 == 45 || cont02 == 45 || cont03 == 45){
		
		return res.send("O horário está cheio!");
		
	}

	
	if(!TestaCPF(cpf)){
		return res.send("Informe um CPF válido!");
	}

	

	console.log(cont01);
	//console.log(cont02);
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
			if(hora == "15h30"){
				cont02 = cont02-1;
			}
			if(hora == "19h30"){
				cont03 = cont03-1;
			}
			
			return res.send("Erro no banco de dados. Talvez o CPF já tenha sido cadadstrado.")
		} 
		//fluxo ideal
		return res.redirect("/");
	});

});

// Permitir acesso a porta 3000
server.listen(3000, function(){
	console.log("iniciei o servidor");
});

server.listen(process.env.PORT || 3000);