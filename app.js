//Carregando Modulos
const express = require('express')
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require('./routes/admin')
const path = require("path")
const { Mongoose } = require('mongoose')
const mongoose = require("mongoose") 
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")


//Configurações
    //Sessão
      app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
      }))
      app.use(passport.initialize())
      app.use(passport.session())
      app.use(flash())
      //Middleware
        app.use((req, res, next) => {
          res.locals.success_msg = req.flash("success_msg")
          res.locals.error_msg = req.flash("error_msg")
          next()
        })

      //Body Parser
      app.use(express.urlencoded({}))
      app.use(express.json())
      //app.use(bodyParser.urlencoded({}))
      //app.use(bodyParser.json())
    
      //Handlebars 
      app.engine('handlebars', handlebars({defaultLayout: 'main'}))
      app.set('view engine', 'handlebars')

    //Mongoose
      mongoose.Promise = global.Promise
      mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log("Conectado ao mongo")
      }).catch((err) => {
        console.log("Erro ao se conectar: "+err)
      })
      
    
    //public
      app.use(express.static(path.join(__dirname,"public")))
      
      //MIDDLEWERE
      /*app.use((req,res,next) => {
        console.log("OI EU SOU UM MIDDLEWERE!")
        next()
      })*/

//Rotas

  app.get('/', (req,res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
      res.render("index", {postagens: postagens})
    }).catch((err) => {
      req.flash("error_msg", "Hpuve um erro interno")
      res.redirect("/404")
    })
  })

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
    if(postagem){
      res.render("postagem/index", {postagem: postagem})
    }else{
      req.flash("error_msg", "Esta postagem nao existe")
      res.redirect("/")
    }

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/")
  })
})

  app.get("/categorias", (req,res) =>{
    Categoria.find().lean().then((categorias) => {
      res.render("categorias/index", {categorias: categorias})
    }).catch((err) =>{
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      req.redirect("/")
    })
  })

  app.get("/categorias/:slug", (req,res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
      if(categoria){
        
        Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
          
          res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

        }).catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar os posts!")
          res.redirect("/")
        })

      }else{
        req.flash("error_msg", "esta categoria não existe")
        res.redirect("/")
      }

    }).catch((err) => {
      req.flash("error_msg", "Houve um errp ao carregar a página desta categoria")
      res.redirect("/")
    })
  })

  app.get("/404", (req,res) => {
    res.send('Erro 404')
  })

 

  app.use('/admin', admin)
  app.use('/usuarios', usuarios)
//Outros
const PORT = 8081
app.listen(PORT,() => {
    console.log("Servidor Rodando! o/ o/ ")
})