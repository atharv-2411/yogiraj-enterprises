const express = require("express");
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");
const { protect } = require("../middleware/auth");
const { clientLogoUpload } = require("../middleware/upload");

router.route("/").get(getClients).post(protect, clientLogoUpload, createClient);

router
  .route("/:id")
  .get(protect, getClient)
  .put(protect, clientLogoUpload, updateClient)
  .delete(protect, deleteClient);

module.exports = router;
