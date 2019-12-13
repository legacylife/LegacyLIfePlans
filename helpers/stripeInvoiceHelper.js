/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 13 sept 2019 10:00 PM
 * @description: Helper class for interaction with stripe invoice
 */
const constants     = require('./../config/constants')
const stripe        = require("stripe")(constants.stripeSecretKey);

module.exports = {
    /**
     * @description : Create stripe customer profile if not created
     * @param userDetails
     * @returns Returns the customer object if the update succeeded.
     * Throws an error if create parameters are invalid (e.g. specifying an invalid coupon or an invalid source).
     * @link https://stripe.com/docs/api/customers/create
     */
    createCustomer: async function ( userDetails ) {
        return await new Promise((resolve, reject) => {
            stripe.customers.create({
                description: 'Customer for '+userDetails.username,
                email: userDetails.username,
                name: userDetails.firstName+' '+userDetails.lastName
            }, function(err, customer) {
                if( err ) {
                    reject(false)
                }
                else{
                    resolve(customer.id)
                }
            })
        })
    },

    /**
     * @param invoiceItems : Creates an item to be added to a draft invoice. If no invoice is specified,
     *                      the item will be on the next invoice created for the customer specified.
     * @param invoices : This endpoint creates a draft invoice for a given customer.
     *                  The draft invoice created pulls in all pending invoice items on that customer, including prorations.
     */
    createInvoice: async function ( userName, stripeCustomerId, amount, currency, userDetails ) {
        let result = await new Promise(async (resolve, reject) => {
            if( !stripeCustomerId && userDetails ) {
                stripeCustomerId = await this.createCustomer( userDetails )
            }
            stripe.invoiceItems.create({
                customer: stripeCustomerId,
                amount: amount*100,
                currency: currency,
                description: 'Advertisement Payment for '+userName,
            }, function(err, invoiceItem) {
                if( err ) {
                    reject(false)
                }
                
                stripe.invoices.create({
                    customer: stripeCustomerId,
                    auto_advance: true, // auto-finalize this draft after ~1 hour
                    collection_method: 'send_invoice',
                    days_until_due: 1,
                }, function(err, invoice) {
                    if( err ) {
                        reject(false)
                    }
                    else{
                        let returnData = { invoiceItemId: invoiceItem.id, invoiceId: invoice.id, stripeCustomerId: stripeCustomerId }
                        resolve(returnData)
                    }
                });
            });
        })
        return result
    },

    /**
     * @description : complete payment for created invoices using invoice ID
     * @param invoiceId
     * @returns Returns the invoice object.
     * @link https://stripe.com/docs/api/invoices/pay?lang=node
     */
    payInvoice: async function ( invoiceId, source, stripeCustomerId ) {
        console.log("**invoiceId, source***",invoiceId, source)
        return await new Promise((resolve, reject) => {
            console.log("invoiceId, source",invoiceId, source)
            stripe.customers.update(
                stripeCustomerId,
                { source : source },
                function(err, customer) {
                    if ( err ) {
                        switch (err.type) {
                            case 'StripeCardError':
                              // A declined card error
                              //err.message; // => e.g. "Your card's expiration year is invalid."
                              reject(err.message);
                              break;
                            case 'StripeRateLimitError':
                              // Too many requests made to the API too quickly
                              reject(err.message);
                              break;
                            case 'StripeInvalidRequestError':
                              // Invalid parameters were supplied to Stripe's API
                              reject(err.message);
                              break;
                            case 'StripeAPIError':
                              // An error occurred internally with Stripe's API
                              reject(err.message);
                              break;
                            case 'StripeConnectionError':
                              // Some kind of error occurred during the HTTPS communication
                              reject(err.message);
                              break;
                            case 'StripeAuthenticationError':
                              // You probably used an incorrect API key
                              reject(err.message);
                              break;
                            default:
                              // Handle any other types of unexpected errors
                              reject("Invalid access. Try again");
                              break;
                          }
                      }
                    stripe.invoices.pay( 
                        invoiceId,
                        function(err, response) {
                            console.log("****err*****",err)
                          //  console.log("****response*****",response)
                            if ( err ) {
                                switch (err.type) {
                                  case 'StripeCardError':
                                    // A declined card error
                                    //err.message; // => e.g. "Your card's expiration year is invalid."
                                    reject(err.message);
                                    break;
                                  case 'StripeRateLimitError':
                                    // Too many requests made to the API too quickly
                                    reject(err.message);
                                    break;
                                  case 'StripeInvalidRequestError':
                                    // Invalid parameters were supplied to Stripe's API
                                    reject(err.message);
                                    break;
                                  case 'StripeAPIError':
                                    // An error occurred internally with Stripe's API
                                    reject(err.message);
                                    break;
                                  case 'StripeConnectionError':
                                    // Some kind of error occurred during the HTTPS communication
                                    reject(err.message);
                                    break;
                                  case 'StripeAuthenticationError':
                                    // You probably used an incorrect API key
                                    reject(err.message);
                                    break;
                                  default:
                                    // Handle any other types of unexpected errors
                                    reject("Invalid access. Try again");
                                    break;
                                }
                              }
                            else if( response.status === 'paid' && response.paid === true ) {
                                resolve(true)
                            }
                            else{
                                reject(false)
                            }
                        }
                    );
                }
            )
        })
    },

    /**
     * @description Retrieves the invoice with the given ID.
     * @param invoiceId
     * @returns Returns an invoice object if a valid invoice ID was provided. Throws an error otherwise
     * @link https://stripe.com/docs/api/invoices/retrieve?lang=node
     */
    retriveInvoice: async function ( invoiceId ) {
        console.log("****invoiceId****",invoiceId)
        return await new Promise(async function (resolve, reject) {
            await stripe.invoices.retrieve(
                invoiceId,
                function(err, invoice) {
                    console.log("****invoice****",invoice)
                    if( err ) {
                        reject(false)
                    }
                    else{
                        resolve(invoice.status)
                    }
                }
            );
        })
    },

    /**
     * @description : Mark a finalized invoice as void. This cannot be undone. 
     * Voiding an invoice is similar to deletion, however it only applies to finalized 
     * invoices and maintains a papertrail where the invoice can still be found.
     * @summary delete invoice if status=='open'
     * @param invoiceId
     * @returns Returns the voided invoice object.
     * @link https://stripe.com/docs/api/invoices/void?lang=node
     */
    deleteInvoice: async function ( invoiceId ) {
        return await new Promise((resolve, reject) => {
            stripe.invoices.voidInvoice(
                invoiceId,
                function(err, response) {
                    if( err ) {
                        reject(false)
                    }
                    else if( response.status === 'void' && response.closed === true ) {
                        resolve(true)
                    }
                    else{
                        reject(false)
                    }
                }
            );
        })
    },

    /**
     * @description : Permanently deletes a draft invoice. This cannot be undone.
     * Attempts to delete invoices that are no longer in a draft state will fail;
     * once an invoice has been finalized, it must be voided.
     * @summary delete invoice if status=='draft'
     * @param invoiceId
     * @returns A successfully deleted invoice. Otherwise, this call throws an error, such as if the invoice has already been deleted.
     * @link https://stripe.com/docs/api/invoices/delete?lang=node
     */
    deleteDraftInvoice: async function ( invoiceId ) {
        return await new Promise((resolve, reject) => {
            stripe.invoices.del(
                invoiceId,
                function(err, response) {
                    if( err ) {
                        reject(false)
                    }
                    else if( response.deleted && response.deleted === true ) {
                        resolve(true)
                    }
                    else{
                        reject(false)
                    }
                }
            );
        })
    },

    /**
     * @description : Delete an invoice item, removing it from an invoice.
     * Deleting invoice items is only possible when they’re not attached 
     * to invoices, or if it’s attached to a draft invoice.
     * @param invoiceId
     * @returns An object with the deleted invoice item’s ID and a deleted flag upon success. Otherwise, this call throws an error, such as if the invoice item has already been deleted.
     * @link https://stripe.com/docs/api/invoiceitems/delete?lang=node
     */
    deleteInvoiceItem: async function ( invoiceItemId ) {
        return await new Promise((resolve, reject) => {
            stripe.invoiceItems.del(
                invoiceItemId,
                function(err, response) {
                    if( err ) {
                        reject(false)
                    }
                    else if( response.object === 'invoiceitem' && response.deleted === true ) {
                        resolve(true)
                    }
                    else{
                        reject(false)
                    }
                }
            );
        })
    }
}