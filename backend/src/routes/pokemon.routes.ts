import { Router } from "express";
import {
  getPokemon,
  getPokemonList,
  getPokemonTypes,
  searchPokemonByName,
} from "../controllers/pokemon.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getPokemonList);
router.get("/search", searchPokemonByName);
router.get("/types", getPokemonTypes);

router.get("/:id", getPokemon);

export default router;
