<?php
namespace App\Http\Middleware;

use App\Models\VO\User;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
//use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Illuminate\Validation\UnauthorizedException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\JWT;
use Tymon\JWTAuth\JWTGuard;
use Illuminate\Http\Request;
use \Tymon\JWTAuth\Http\Middleware\BaseMiddleware;
class RefreshToken extends BaseMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     * @throws AuthenticationException
     */
    public function handle(Request $request, Closure $next)
    {

        try {

            // 检查此次请求中是否带有 token，如果没有则抛出异常。
            $this->checkForToken($request);

            // 使用 try 包裹，以捕捉 token 过期所抛出的 TokenExpiredException  异常

            // 检测用户的登录状态，如果正常则通过
            if ($this->auth->parseToken()->authenticate()) {

                return $next($request);
            }

            throw new UnauthorizedException('jwt-auth', '未登录');
        } catch (TokenExpiredException $exception) {
            // 此处捕获到了 token 过期所抛出的 TokenExpiredException 异常，我们在这里需要做的是刷新该用户的 token 并将它添加到响应头中
            try {
                // 刷新用户的 token

                $token = $this->auth->refresh();
                // 使用一次性登录以保证此次请求的成功
                Auth::guard('api')->onceUsingId($this->auth->manager()->getPayloadFactory()->buildClaimsCollection()->toPlainArray()['sub']);
                $request->headers->set('Authorization','Bearer '.$token);

            } catch (TokenBlacklistedException | TokenExpiredException $exception) {
                // 如果捕获到此异常，即代表 refresh 也过期了，用户无法刷新令牌，需要重新登录。
                throw new AuthenticationException($exception->getMessage());
            }
        }

        // 在响应头中返回新的 token
        return $this->setAuthenticationHeader($next($request), $token);
    }

}
