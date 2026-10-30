import { Router } from "express";
import {
  addPokemonToCollection,
  removePokemonFromCollection,
} from "../controllers/collection.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Cada usuario solo ve y modifica su propia colección
router.use(requireAuth);

router.put("/:pokemonId", addPokemonToCollection);
router.delete("/:pokemonId", removePokemonFromCollection);

export default router;
