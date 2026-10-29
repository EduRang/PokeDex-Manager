import { Router } from "express";
import { getPokemon } from "../controllers/pokemon.controller.js";

const router = Router();

router.get("/:id", getPokemon);

export default router;
