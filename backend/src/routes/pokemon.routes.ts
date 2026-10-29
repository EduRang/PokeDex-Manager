import { Router } from "express";
import {
  getPokemon,
  getPokemonList,
  searchPokemonByName,
} from "../controllers/pokemon.controller.js";

const router = Router();

router.get("/", getPokemonList);
router.get("/search", searchPokemonByName);
router.get("/:id", getPokemon);

export default router;
