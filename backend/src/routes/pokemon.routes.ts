import { Router } from "express";
import { getPokemon, getPokemonList } from "../controllers/pokemon.controller.js";

const router = Router();

router.get("/", getPokemonList);
router.get("/:id", getPokemon);

export default router;
