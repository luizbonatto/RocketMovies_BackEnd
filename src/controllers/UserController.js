const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const { hash, compare } = require("bcryptjs")

class UsersController {

  async create (request, response) {
    const { name, email, password } = request.body

    const checkEmail = await knex("users").where({email}).first()    

    if(checkEmail) {
      throw new AppError("O email inserido ja esta em uso")
    
  }

    const hashedpassword = await hash(password, 8)

    await knex("users").insert({
      name,
      email,
      password: hashedpassword
    })

    response.status(201).json()
    
  }

  async update(request, response) {
    const {name, email, password, old_password} = request.body
    const {id} = request.params

    const user = await knex("users").where({id}).first()

    if(!user){
      throw new AppError("Usuário não encontrado")
    }

    if(email){

    const userWithUpdatedEmail = await knex("users").where({email}).first()

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError("Este e-mail ja está em uso")
      }
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if(password && !old_password){
      throw new AppError("Você precisa informar a senha antiga para definir uma nova senha")
    }

   if(password && old_password){
    const checkPassword = await compare(old_password, user.password)

    if(!checkPassword){
      throw new AppError ("A senha antiga não confere")
    }
   }

   user.password = await hash(password, 8)

    await knex("users").where({id}).update({
      name: user.name,
      email: user.email,
      password: user.password
    })

    response.status(200).json()

  }
  
}

module.exports = UsersController