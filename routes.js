var express = require('express')
var router = express.Router()

router.use("/auth", require("./routes/authenticationRoute"))

module.exports = router
