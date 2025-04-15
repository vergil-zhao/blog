---
layout: post
title: CS:APP Lab 5 - Shell Lab
date: 2018-04-08 12:50:00
tags:
  - CSAPP
categories:
  - 计算机基础
---

目标是填写空缺的函数并通过测试。为了简便起见，这里不对所有的系统调用的返回值和 `errno` 做判断，但是应该按照书中的描述，做一个包装函数，处理系统调用的返回值和错误判断。另外 `printf()` 不是一个异步信号安全的函数，这里仅为简便起见。

<!-- more -->

熟读第八章之后，以通过测试为目标这个任务并没有什么难度，只要注意一下几个细节：

在适当的地方阻塞信号
只用一个 `waitpid()`在 `sigchld_handler()` 里，使得处理更清晰
不要忘记对 job 设定状态

BTW，做过之后你应该会注意到这个练习从侧面反映了测试的重要性。

下面上注释好的代码：

```c
void eval(char *cmdline)
{
    char *argv[10];
    int is_background = parseline(cmdline, argv);

    // 什么都没输入，忽略
    if (argv[0] == NULL)
        return;

    int is_builtin = builtin_cmd(argv);

    // 已执行内建命令
    if (is_builtin)
        return;

    int pid = 0;
    sigset_t mask_child, mask_all, prev;
    sigfillset(&mask_all);
    sigemptyset(&mask_child);
    sigaddset(&mask_child, SIGCHLD);

    // 在 fork 子进程之前要先阻塞 SIGCHLD 信号
    // 防止在父进程还未运行至 addjob 之前子进程就退出了
    sigprocmask(SIG_BLOCK, &mask_child, &prev);

    if ((pid = fork()) == 0) { // 进入子进程
        // 要先解除阻塞，否则子进程本身会收不到它自己的子进程引起的信号
        sigprocmask(SIG_SETMASK, &prev, NULL);

        // 设定分组与自己的 pid 相同
        setpgid(0, 0);

        // 正常运行 exec 系列函数之后，内存被替换，不会返回
        // 未找到外部命令时一定要 exit，否则还会继续运行下去
        if (execve(argv[0], argv, environ) < 0) {
            printf("%s: Command not found\n", argv[0]);
            exit(0);
        }
    }

    // 防止 addjob 被任何信号打断，产生 deletejob 发生在
    // addjob 之前等类似的问题
    sigprocmask(SIG_BLOCK, &mask_all, NULL);
    int state = is_background ? BG : FG;
    addjob(jobs, pid, state, cmdline);
    sigprocmask(SIG_SETMASK, &prev, NULL);

    // 如果是后台运行则打印任务
    if (is_background)
        printjob(pid);
    else
    // 如果是前台运行则等待
        waitfg(pid);
}

int builtin_cmd(char **argv)
{
    // 比较字符串做出相应地行为即可
    // 要注意返回的值
    if (strcmp(argv[0], "bg") == 0 || strcmp(argv[0], "fg") == 0) {
        do_bgfg(argv);
        return 1;
    } else if (strcmp(argv[0], "quit") == 0) {
        exit(0);
    } else if (strcmp(argv[0], "jobs") == 0) {
        listjobs(jobs);
        return 1;
    }
    return 0;     /* not a builtin command */
}

void do_bgfg(char **argv)
{
    int id;
    struct job_t *job;


    if (argv[1] == NULL) {
        // 没有参数，打印错误信息
        printf("%s command requires PID or %%jobid argument\n", argv[0]);
        return;

    } else if (sscanf(argv[1], "%%%d", &id) > 0) {
        // 读取到 jobid
        job = getjobjid(jobs, id);
        if (job == NULL) {
            printf("%%%d: No such job\n", id);
            return;
        }
    } else if (sscanf(argv[1], "%d", &id) > 0) {
        // 读取到 pid
        job = getjobpid(jobs, id);
        if (job == NULL) {
            printf("(%d): No such process\n", id);
            return;
        }
    } else {
        // 错误的参数格式
        printf("%s: argument must be a PID or %%jobid\n", argv[0]);
        return;
    }

    // 向对应的进程组发送 SIGCONT 信号
    // 并设置对应的状态
    if (argv[0][0] == 'f') {
        kill(-job->pid, SIGCONT); // 要注意是进程组，负数 pid
        job->state = FG;
        waitfg(job->pid);
    } else {
        kill(-job->pid, SIGCONT);
        job->state = BG;
        printjob(job->pid);
    }
}

void waitfg(pid_t pid)
{
    // 因为只需要等待前台任务，而前台运行的任务同时只会有一个
    // 所以只需要等到一个前台任务都没有了即可
    sigset_t mask;

    // 设定不阻塞任何信号，接受到任何信号都检查前台任务是否结束
    sigemptyset(&mask);
    while (fgpid(jobs) > 0) {
        sigsuspend(&mask);
    }
}

void sigchld_handler(int sig)
{
    int pid, status;
    struct job_t *job;

    // WNOHANG 不要挂起 且 WUNTRACED 接收未捕捉到的信号引起的子进程停止或结束
    while ((pid = waitpid(-1, &status, WNOHANG | WUNTRACED)) > 0) {
        job = getjobpid(jobs, pid);

        // 对应情况分别处理
        if (WIFSTOPPED(status)) {
            job->state = ST;
            printf("Job [%d] (%d) stopped by signal 20\n", job->jid, job->pid);
        } else if (WIFEXITED(status)) {
            deletejob(jobs, pid);
        } else {
            printf("Job [%d] (%d) terminated by signal 2\n", job->jid, job->pid);
            deletejob(jobs, pid);
        }
    }
}

void sigint_handler(int sig)
{
    int pid;
    // 简单的发送信号即可，集中至子进程信号处理函数里处理
    if ((pid = fgpid(jobs)) > 0) {
        kill(-pid, SIGINT);
    }
}

void sigtstp_handler(int sig)
{
    int pid;
    // 简单的发送信号即可，集中至子进程信号处理函数里处理
    if ((pid = fgpid(jobs)) > 0) {
        kill(-pid, SIGTSTP);
    }
}

void printjob(int pid) {
    struct job_t *job = getjobpid(jobs, pid);
    if (job != NULL) {
        printf("[%d] (%d) ", job->jid, job->pid);
        printf("%s", job->cmdline);
    }
}
```
