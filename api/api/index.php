<?php

// On Vercel the function lives at /api/index.php, so the runtime sets SCRIPT_NAME to
// "/api/index.php". Symfony would then treat "/api" as the base path and strip it from
// the route, breaking Laravel's /api/* routes. Normalize it so the full request URI
// reaches the router.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

require __DIR__.'/../public/index.php';
