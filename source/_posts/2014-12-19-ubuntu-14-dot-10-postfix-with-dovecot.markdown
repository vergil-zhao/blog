---
layout: post
title: "Ubuntu 14.10 邮件服务器搭建：Postfix 和 dovecot "
date: 2014-12-19 15:44:48 +0800
comments: true
categories: linux
---

这几天需要在服务器上搭个邮件服务器，没想到还挺麻烦的。

麻烦主要来自两方面，可以选择的邮件服务器软件略多(例如 qmail xmail sendmail 等等，还有转发服务，验证服务相关的，cyrus，sasl等等)，各种配置略苦。

各种 Search 之后选择了 *Postfix* 和 *dovecot*，*Postfix* 是本体，*dovecot* 作为转发服务(IMAP, POP3, SMTP)。

<!-- more -->

<div class="post_warn"><b>Important: </b>以下方法不使用 ssl ，对安全性有要求的话，请勿采用！</div>

<br />

###软件包安装

---

直接上命令

```bash
# use root
sudo -i

apt-get install postfix

# if you get a fatal, usually use "apt-get -f install"
apt-get install dovecot-core dovecot-pop3d dovecot-smtpd

apt-get install mail-stack-delivery

apt-get install mailutils 
```

以上命令安装完所需的软件包，接下来就是蛋疼的配置时间啦。老实说，要想熟悉全部设置选项非常费劲也费时间，还要正确的设置，相当苦啊 Σ( ￣□￣||)

so~，we need search engine. Then I got a nice guide article:

[使用 Ubuntu 安裝郵件伺服器 (Mail Server)：Postfix + Dovecot + Openwebmail](http://www.nowtaxes.com.tw/node/1147)

2010年的文章，所以有些内容已经不适用了，不过只有个别地方。

文章中最后的 Openwebmail 的依赖库有点略旧了，装到最后出现版本问题，要求不高就简单的用客户端就好了。

下面整理一下文章内容。

<br /><br />

###配置

---

修改 `/etc/postfix/main.cf`


<table style="border:0;">
    <tr>
        <td><li>第  9行</li></td>
        <td>删除 (Ubuntu)</td>
    </tr>
    <tr>
        <td><li>第21行到第25行&nbsp;&nbsp;</li></td>
        <td>注释掉</td>
    </tr>
    <tr>
        <td><li>第34行</li></td>
        <td>添加自己的域名，例如 mail.example.com</td>
    </tr>
    <tr>
        <td><li>第41行</li></td>
        <td>注释掉，使用 mbox 格式</td>
    </tr>
    <tr>
        <td><li>第54行</li></td>
        <td>注释掉</td>
    </tr>
    <tr>
        <td><li>第56行到第61行</li></td>
        <td>注释掉</td>
    </tr>
</table>
<br />

变更的地方已高亮

配置文件中的最后几行，要在安装完 `mail-stack-delivery` 包之后才会出现


``` cf3 mark: 9, 21-25, 34, 41, 54, 56-61
# See /usr/share/postfix/main.cf.dist for a commented, more complete version
 
 
# Debian specific:  Specifying a file name will cause the first
# line of that file to be used as the name.  The Debian default
# is /etc/mailname.
#myorigin = /etc/mailname
 
smtpd_banner = $myhostname ESMTP $mail_name
biff = no
 
# appending .domain is the MUA's job.
append_dot_mydomain = no
 
# Uncomment the next line to generate "delayed mail" warnings
#delay_warning_time = 4h
 
readme_directory = no
 
# TLS parameters
#smtpd_tls_cert_file = /etc/ssl/certs/ssl-mail.pem
#smtpd_tls_key_file = /etc/ssl/private/ssl-mail.key
#smtpd_use_tls = yes
#smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
#smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache
 
# See /usr/share/doc/postfix/TLS_README.gz in the postfix-doc package for
# information on enabling SSL in the smtp client.
 
myhostname = dns.example.com.tw
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
myorigin = /etc/mailname
mydestination = localhost, localhost.localdomain, mail.example.com
relayhost = 
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
 
#home_mailbox = Maildir/
 
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/dovecot-auth
smtpd_sasl_authenticated_header = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = $myhostname
broken_sasl_auth_clients = yes
 
smtpd_recipient_restrictions = reject_unknown_sender_domain, reject_unknown_recipient_domain, reject_unauth_pipelining, permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination
smtpd_sender_restrictions = reject_unknown_sender_domain
 
#mailbox_command = /usr/lib/dovecot/deliver -c /etc/dovecot/conf.d/01-dovecot-postfix.conf -n -m "${EXTENSION}"
 
#smtp_use_tls = yes
#smtpd_tls_received_header = yes
#smtpd_tls_mandatory_protocols = SSLv3, TLSv1
#smtpd_tls_mandatory_ciphers = medium
#smtpd_tls_auth_only = yes
#tls_random_source = dev:/dev/urandom
```


接下来修改 `/etc/dovecot/conf.d/99-mail-stack-delivery.conf`

<table>
    <tr>
        <td>第 3 行</td>
        <td>disable_plaintext_auth = no，使用 Ubuntu 用户账户的用户名和密码</td>
    </tr>
    <tr>
        <td>第 4 行</td>
        <td>ssl = no，不使用 SSL 认证</td>
    </tr>
    <tr>
        <td>第 5 行到第 7 行</td>
        <td>注释掉</td>
    </tr>
    <tr>
        <td>第 8 行</td>
        <td>注释掉，使用 mbox 格式</td>
    </tr>
    <tr>
        <td>第 9 行</td>
        <td>加一行 mail_location = mbox:~/mail:INBOX=/var/spool/mail/%u</td>
    </tr>
</table>


```cf3 mark:3-9
# Some general options
protocols = imap pop3 sieve
disable_plaintext_auth = no
ssl = no
# ssl_cert = </etc/dovecot/dovecot.pem
# ssl_key = </etc/dovecot/private/dovecot.pem
# ssl_cipher_list = ALL:!LOW:!SSLv2:ALL:!aNULL:!ADH:!eNULL:!EXP:RC4+RSA:+HIGH:+MEDIUM
# mail_location = maildir:~/Maildir
mail_location = mbox:~/mail:INBOX=/var/mail/%u # (for mbox)
auth_username_chars = abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890.-_@

# IMAP configuration
protocol imap {
        mail_max_userip_connections = 10
        imap_client_workarounds = delay-newmail
}

# POP3 configuration
protocol pop3 {
        mail_max_userip_connections = 10
        pop3_client_workarounds = outlook-no-nuls oe-ns-eohe
}

# LDA configuration
protocol lda {
        postmaster_address = postmaster
        mail_plugins = sieve
        quota_full_tempfail = yes
        deliver_log_format = msgid=%m: %$
        rejection_reason = Your message to <%t> was automatically rejected:%n%r
}

# Plugins configuration
plugin {
        sieve=~/.dovecot.sieve
        sieve_dir=~/sieve
}

# Authentication configuration
auth_mechanisms = plain login

service auth {
  # Postfix smtp-auth
  unix_listener /var/spool/postfix/private/dovecot-auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}
```


使用命令测试一下 `telnet localhost 25`

Postfix 会有如下回应

```bash
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
220 yourhostname ESMTP Postfix
```

然后使用命令 `ehlo localhost`

回应如下的话就设定 ok 啦

```bash
250-yourhostname
250-PIPELINING
250-SIZE 10240000
250-VRFY
250-ETRN
250-AUTH PLAIN LOGIN
250-AUTH=PLAIN LOGIN
250-ENHANCEDSTATUSCODES
250-8BITMIME
250 DSN
```

不要忘记创建用户

```bash
# create a account and home dir "/home/admin"
useradd -m admin
passwd admin
```

这样你的邮件地址就是 `admin@example.com`

接下来就可以使用邮件客户端来连接啦

可以使用命令 `netstat -apn | grep 110` 会看到一行

```bash
tcp    0    0 0.0.0.0:110    0.0.0.0:*     LISTEN     26719/dovecot 
```

POP3 服务可以正常使用了，**<font color="red">但是</font>**，只能接收邮件不能发送，SMTP 连不上，也许是因为我使用的客户端，或者我打开的方式不对...

<br /><br />

以上，就完成了一个基本的邮件服务器的搭建。