var express = require('express')
var router = express.Router()

router.use("/auth", require("./routes/authenticationRoute"))
router.use("/userlist", require("./routes/userlistRoute"))
router.use("/cms", require("./routes/cmsRoute"))
router.use("/emailtemp", require("./routes/emailTemplatesRoute"))
router.use("/globalsetting", require("./routes/globalSettingsRoute"))





module.exports = router
