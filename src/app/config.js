const os = require( 'os' );
const requiredEnvs = [];

function env( name, defaultValue ){

	var exists = ( typeof process.env[ name ] !== 'undefined' );

	return ( exists ? process.env[ name ] : defaultValue );
}

function requiredEnv( name, defaultValue ){

	requiredEnvs.push( name );

	return env( name, defaultValue );
}

function bool( name, defaultValue ){

	return ( env( name, defaultValue ) + '' ) === 'true';
}

function number( name, defaultValue ){

	return parseInt( env( name, defaultValue ), 10 );
}

function checkRequiredEnvs(){

	const missing = [];

	for( let name of requiredEnvs ){

		if( typeof process.env[ name ] === 'undefined' ){

			missing.push( name );
		}
	}

	if( missing.length ){

		console.log( 'Missing required env variables:', missing );
		throw new Error( 'Missing required env variables' );
	}
}

const cpus = ( os.cpus().length || 1 );
const isDev = ( ( process.env.NODE_ENV || 'development' ) === 'development' );

let config = {
	isDev,
	showErrors: isDev,
	version: env( 'npm_package_version', 'unknown' ),
	server: {
		protocol: env( 'SERVER_PROTOCOL', 'http' ),
		host: env( 'SERVER_HOST', 'localhost' ),
		port: env( 'SERVER_PORT', env( 'PORT', 8080 ) ),
		cpus,
		workers: env( 'SERVER_WORKERS', env( 'WEB_CONCURRENCY', cpus ) )
	},
	views: {
		cache: bool( 'CACHE_VIEWS', true )
	},
	redis: {
		host: env( 'REDIS_HOST' ),
		port: number( 'REDIS_PORT' ),
		password: env( 'REDIS_PASSWORD' ),
		url: env( 'REDIS_URL' ) || env( 'REDISTOGO_URL' ),
		tls: bool( 'REDIS_USE_TLS' )
	},
	session: {
		ttl: ( 1000 * 60 * 60 * 2 ),//milliseconds for cookie
		secret: env( 'SESSION_SECRET', 'thisisadefaultsecretchangemenow' )
	},
	cookieSecret: env( 'COOKIE_SECRET' ),
	logLevel: env( 'LOG_LEVEL', 'warn' ),
	sentryDsn: env( 'SENTRY_DSN' ),
	analyticsId: env( 'ANALYTICS_ID' ),
	sso: {
		protocol: env( 'SSO_PROTOCOL', 'https' ),
		domain: requiredEnv( 'SSO_DOMAIN' ),
		port: number( 'SSO_PORT', 443 ),
		client: requiredEnv( 'SSO_CLIENT' ),
		secret: requiredEnv( 'SSO_SECRET' ),
		mockCode: env( 'SSO_MOCK_CODE' ),
		path: {
			auth: requiredEnv( 'SSO_PATH_AUTH' ),
			token: requiredEnv( 'SSO_PATH_TOKEN' ),
			introspect: requiredEnv( 'SSO_PATH_INTROSPECT' ),
			user: env( 'SSO_PATH_USER' )
		},
		redirectUri: requiredEnv( 'SSO_REDIRECT_URI' ),
		paramLength: number( 'OAUTH_PARAM_LENGTH', 75 )
	},
	backend: {
		protocol: env( 'BACKEND_PROTOCOL', 'http' ),
		host: env( 'BACKEND_HOST', 'localhost' ),
		port: env( 'BACKEND_PORT', 8000 )
	},
	datahubDomain: env( 'DATA_HUB_DOMAIN', 'https://www.datahub.trade.gov.uk' ),
};

config.backend.href = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}`;

checkRequiredEnvs();

module.exports = config;
