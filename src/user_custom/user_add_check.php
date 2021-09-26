<?php
session_start();
session_regenerate_id(true);
if(isset($_SESSION['login'])==false)
{
    print'ログインされていません。<br>';
    print'<a href="../user_login/user_login.html">ログイン画面へ</a>';
    exit();
}
else
{
    print $_SESSION['user_name'];
    print 'さんがログイン中<br>';
    print '<br>';
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>task管理</title>
    </head>
    <body>

        <?php

        require_once('../common/common.php');

        print_r ($_POST);

        $post=sanitize($_POST);
        $user_email = $post['email'];
        $user_gakunen = $post['gakunen'];
        $user_name = $post['name'];
        $user_pass = $post['pass'];
        $user_pass2 = $post['pass2'];
        $user_photo = $_FILES['user_photo'];

        //print_r ($_POST);


        //$staff_name=htmlspecialchars($staff_name,ENT_QUOTES,'UTF-8');
        //$staff_pass=htmlspecialchars($staff_pass,ENT_QUOTES,'UTF-8');
        //$staff_pass2=htmlspecialchars($staff_pass2,ENT_QUOTES,'UTF-8');


        //メアド入力チェック
        if(preg_match('/\A[\w\-\.]+\@[\w\-\.]+\.([a-z]+)\z/',$user_email)==0)
        {
            print 'メールアドレスを正確に入力してください。<br><br>';
            $okflg=false;
        }else
        {
            print 'メールアドレス<br>';
            print $user_email;
            print '<br>';
        }
        if($user_gakunen == '---')
        {
            echo '学年が選択されていません';
        }
        //名前入力チェック
        if($user_name=='')
        {
            print '名前が入力されていません。<br>';
        }
        else
        {
            print '名前:';
            print $user_name;
            print '<br>';
        }
        //パスワードチェック
        if($user_pass=='')
        {
            print 'パスワードが入力されていません。<br>';
        }
        if($user_pass!=$user_pass2)
        {
            print 'パスワードが一致しません。<br>';
        }
        if($user_name==''||$user_pass==''||$user_pass!=$user_pass2)
        {
            print '<form>';
            print '<input type="button" onclick="history.back()" value="戻る">';
            print '<form>';
        }else 
         //画像チェック
        if($user_photo['size'] > 0)
        {
            if($user_photo['size'] > 1000000)
            {
                print '画像が大きすぎます';
            } else
            {
                move_uploaded_file($user_photo['tmp_name'],'./gazou/'.$user_photo['name']);
                print '<img src="./gazou/'.$user_photo['name'].'">';
                print '<br>';
            }
        }

       
         $user_pass=md5($user_pass);
      print '<form method="post" action="user_add_done.php">';
        print '<input type="hidden" name="email" value="'.$user_email.'">';
        print '<input type="hidden" name="gakunen" value="'.$user_gakunen.'">';
        print '<input type="hidden" name="name" value="'.$user_name.'">';
        print '<input type="hidden" name="pass" value="'.$user_pass.'">';
        //print '<input type="hidden" name="gazou" value="'.$user_gazou.'">';
        print '<input type="hidden" name="photo_name" value="'.$user_photo['name'].'">';
        print '<br>';
        print '<input type="button" onclick="history.back()" value="戻る">';
        print '<input type="submit" value="OK">';
      print '</form>';
     
     ?>

    </body>
</html>