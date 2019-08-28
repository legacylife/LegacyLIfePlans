/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 20 Aug 2019 10:00 PM
 * @description: Dynamic response messages return from array
 */
let responseArray = [
    {
        "code":601,
        "type":"done",
        "message":"Done",
    },
    {
        "code":602,
        "type":"fail",
        "message":"Failed",
    },
    {
        "code":603,
        "type":"response-failed",
        "message":"Something went wrong",
    },
    {
        "code":604,
        "type":"server-error",
        "message":"Some error Occured",
    },
    {
        "code":605,
        "type":"no-record",
        "message":"Record not found.",
    },
    {
        "code":606,
        "type":"user-not-found",
        "message":"Looks like your account does not exist. Sign up to create an account.",
    },
    {
        "code":607,
        "type":"successful-action",
        "message":"{field} has been {status} successfully", //{status} => sent, added, saved, updated, deleted, removed
    },
    {
        "code":608,
        "type":"account-pending",
        "message":"Your account is under review, you will receive account confirmation on your registered email id.",
    },
    {
        "code":609,
        "type":"account-deactivate",
        "message":"Your account has been deactivated. Please connect with the admin at {support_email} for any queries.",
    },
    {
        "code":610,
        "type":"account-rejected",
        "message":"Your account has been rejected by the admin. Please connect with the admin at {support_email} for any queries.",
    },
    {
        "code":611,
        "type":"account-blocked",
        "message":"Your account has been blocked. Please connect with the admin at {support_email} for any queries.",
    },
    {
        "code":612,
        "type":"account-not-verified",
        "message":"Your account has not been verified. Please connect with the admin at {support_email} for any queries.",
    },
    {
        "code":613,
        "type":"email-not-verified",
        "message":"Your email has not been verified. Please connect with the admin at {support_email} for any queries.",
    },
    {
        "code":614,
        "type":"incorrect-field",
        "message":"Incorrect {field}. Please try again.",
    },
    {
        "code":615,
        "type":"incorrect-login-details",
        "message":"Incorrect email or password. Please try again."
    },
    {
        "code":616,
        "type":"password-instructions",
        "message":"We have sent you the instructions to set your account password. Please check your mail.",
    },
    {
        "code":617,
        "type":"password-set",
        "message":"Your password has been set successfully. Please log in to your account.",
    },
    {
        "code":618,
        "type":"invalid-credentials",
        "message":"Invalid login credentials.",
    },
    {
        "code":619,
        "type":"all-required-field",
        "message":"Please enter mandatory fields.",
    },
    {
        "code":620,
        "type":"required-field",
        "message":"Please fill in {field} details.",
    },
    {
        "code":621,
        "type":"login-successful",
        "message":"Successfully logged in!",
    },
    {
        "code":622,
        "type":"email-verification",
        "message":"Email verification successful. Logging in to your account",
    },
    {
        "code":623,
        "type":"email-exists",
        "message":"This email id is already taken.Please try another",
    },
    {
        "code":624,
        "type":"change-email-exists",
        "message":"Looks like you already have an account registered with this email. Please log in to access your account.",
    },
    {
        "code":625,
        "type":"add-user-email",
        "message":"Looks like email id already have an account registered with this email as {userType}.",
    },
    {
        "code":626,
        "type":"logout-successful",
        "message":"You have been logout! Please sign-in again",
    },
    {
        "code":627,
        "type":"valid-field-details",
        "message":"Please enter valid {field}",
    },
    {
        "code":628,
        "type":"invalid-link",
        "message":"Invalid link, Please try again.",
    },
    {
        "code":629,
        "type":"otp-sent",
        "message":"A new OTP has been sent on your email.",
    },
    {
        "code":630,
        "type":"customer-signup",
        "message":"Welcome to Legacy Life Plans. Your account credentials have been successfully saved.",
    },
    {
        "code":631,
        "type":"adviser-signup",
        "message":"You have successfully signed up. Please update your profile.",
    },
    {
        "code":632,
        "type":"not-subscribed",
        "message":"No subscription plan has been set",
    },
    {
        "code":633,
        "type":"subscription-canceled",
        "message":"The susbcription has already been cancelled.",
    },
    {
        "code":634,
        "type":"subscription-successful",
        "message":"Congratulations! You have been successfully upgraded your subscription.",
    },
    {
        "code":635,
        "type":"unauthorize-access",
        "message":"Unauthorized access",
    },
    {
        "code":636,
        "type":"request-sent",
        "message":"Request has been sent successfully!",
    },
    {
        "code":637,
        "type":"user-details-sent",
        "message":"The {field} details are sent on your email.",
    },
    {
        "code":699,
        "type":"custom-message",
        "message":"{message}",
    },
];

var helper = {}

helper.data = function(code = null, data = [] ) {
    let res = ''
    if ( code ) {
        let message = responseArray.find( (x) => { return x.code==code }).message
        if( data ) {
            data.forEach(function(element) {
                if( element.key && element.val ) {
                    message = message.replace(element.key,element.val)
                }
            });
        }
        res = message
    }
    return res
}

module.exports = helper