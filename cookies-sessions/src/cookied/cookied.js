//Session Management

const {v4: uuidv4} = require('uuid');
const sessionStore = {};

/**
 * Middleware that checks incoming request for a Cookie header
 * and parses name-value pairs into a property on the req object, hwCookies
 * @param  {Object} req The request object
 * @param  {Object} res The response object
 * @callback next a callback to run
 */
function parseCookies(req, res, next){
    const cookieHeader = req.get('Cookie');
    //console.log(cookieHeader);
    req.hwCookies = {};
    if(cookieHeader){
        cookieHeaderSplit = cookieHeader.split('; ');
        //console.log(cookieHeaderSplit);
        for(let i = 0; i < cookieHeaderSplit.length; i++){ 
            const keyValuePair = cookieHeaderSplit[i].split('=');
            req['hwCookies'][keyValuePair[0]] = keyValuePair[1];
        }
    }
    
    next();
}

/**
 * Middleware that checks cookies from the request for a session id
 * and retrieves data for session id
 * if not an existing session id, or no session id came through, 
 * then generate new session id
 * @param  {Object} req The request object
 * @param  {Object} res The response object
 * @callback next a callback to run
 */
function manageSession(req, res, next){ 
    console.log("session store:", sessionStore);
    console.log("req.hwCookies.sessionId:", req.hwCookies.sessionId);
    let sessionId = req.hwCookies.sessionId;
    if(req.hwCookies.sessionId && sessionStore.hasOwnProperty(req.hwCookies.sessionId)){
        req.hwSession = sessionStore[sessionId];
        console.log(`session already exists: ${sessionId}`);
    } else { 
        sessionId = uuidv4();
        sessionStore[sessionId] = {};
        res.append('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
        console.log(`session generated: ${sessionId}`);
    } 
    req.hwSession = sessionStore[sessionId];
    req.hwSession.sessionId = sessionId;
    next();
    
}

module.exports = {
    parseCookies: parseCookies,
    manageSession: manageSession,
    // add more property name to function mappings...
};