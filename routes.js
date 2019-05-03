var express = require('express')
var router = express.Router()

router.use("/auth", require("./routes/authenticationRoute"))
router.use("/userlist", require("./routes/userlistRoute"))
router.use("/cms", require("./routes/cmsRoute"))

module.exports = router
