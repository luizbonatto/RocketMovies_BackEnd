const { Router } = require("express")
const MoviesController = require("../controllers/MoviesController")

const moviescontroller = new MoviesController
const moviesRoutes = Router()

moviesRoutes.post("/:user_id", moviescontroller.create)
moviesRoutes.delete("/:id", moviescontroller.delete)
moviesRoutes.get("/:id", moviescontroller.show)
moviesRoutes.get("/", moviescontroller.index)

module.exports = moviesRoutes