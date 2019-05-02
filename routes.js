var express = require('express')
var router = express.Router()

router.use("/auth", require("./routes/authenticationRoute"))
router.use("/userlist", require("./routes/userlistRoute"))

module.exports = router
