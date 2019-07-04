var express = require('express')
var router = express.Router()
router.use("/auth", require("./routes/authenticationRoute"))
router.use("/userlist", require("./routes/userlistRoute"))
router.use("/cms", require("./routes/cmsRoute"))
router.use("/emailtemp", require("./routes/emailTemplatesRoute"))
router.use("/globalsetting", require("./routes/globalSettingsRoute"))
router.use("/advisor", require("./routes/advisorRoute"))
router.use("/customer", require("./routes/customerRoute"))
router.use("/finalwish", require("./routes/finalWishRoute"))
router.use("/pets", require("./routes/petsRoute"))
router.use("/timeCapsule", require("./routes/timeCapsuleRoute"))
router.use("/insuranceFinanceDebt", require("./routes/insuranceFinanceDebtRoute"))
router.use("/passwordsDigitalAssets", require("./routes/passwordsDigitalAssestsRoute"))
router.use("/lettersMessages", require("./routes/LettersMessagesRoute"))
router.use("/documents", require("./routes/documentsUploadRoute"))
router.use("/specialNeeds", require("./routes/specialNeedsRoute"))
router.use("/realEstateAssets", require("./routes/realEstateAssetsRoute"))
router.use("/invite", require("./routes/inviteRoute"))
router.use("/trustee", require("./routes/trustiesRoute"))

module.exports = router