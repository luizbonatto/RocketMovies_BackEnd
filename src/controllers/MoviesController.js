const knex = require("../database/knex")

class MoviesController {
  async create (request, response) {
    const { title, description, rating, tags } = request.body
    const { user_id } = request.params

    const note_id = await knex("movie_notes").insert({
      title, 
      description, 
      rating,
      user_id
    })

    const tagsInsert = tags.map(tags => {
      return{
        note_id,
        user_id,
        name: tags
      }
    })

    await knex("movie_tags").insert(tagsInsert)

    response.status(201).json()

  }

  async delete (request, response) {
    const { id } = request.params

    await knex("movie_notes").where({id}).delete()

    return response.json()

  }

  async show (request, response) {
    const { id } = request.params

    const film = await knex("movie_notes").where({id}).first()
    const tags = await knex("movie_tags").where({note_id: id}).orderBy("name")

    return response.json({
      ...film,
      tags
    })
  }

  async index (request, response) {
    const { user_id,  title, tags } = request.query

    let films

    if (tags) {
      const filtertags = tags.split(",").map(tag => tag.trim())

      films = await knex("movie_tags")
      .select([
        "movie_notes.id",
        "movie_notes.title",
        "movie_notes.user_id"
      ])
      .where("movie_notes.user_id", user_id)
      .whereLike("movie_notes.title", `%${title}%`)
      .whereIn("movie_tags.name", filtertags)
      .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
      .orderBy("movie_notes.title")
    }else{
    
      films = await knex("movie_notes")
      .where({user_id})
      .whereLike("movie_notes.title", `%${title}%`)
      .orderBy("title")
  }

  const userTags = await knex("movie_tags").where({user_id})
  const filmsWithTags = films.map(film => {
    const filmTags = userTags.filter(tag => tag.note_id === film.id)

    return {
      ...film,
      tags: filmTags
    }
  })

  return response.json(filmsWithTags)

  }

}

module.exports = MoviesController