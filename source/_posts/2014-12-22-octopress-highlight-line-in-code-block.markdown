---
layout: post
title: "为 Octopress 中的代码块添加高亮行的功能"
date: 2014-12-22 10:07:49 +0800
comments: true
categories: Blog Relations
---

在 _Octopress_ 的官方文档中看到，反引号代码块(Backtick Code Block)是有高亮行的功能的

<p style="font-size:30px;color:red">But</p>

<!-- more -->

我们先看这个网页 -- [Backtick Code Blocks](http://octopress.org/docs/plugins/backtick-codeblock/)

![官方文档截图](/images/2014_12/backtick_codeblock.png)

截图时间 2014.12.22

事实上是无论我把 `mark:1, 2-3` 这种类似的写在任何地方都没效果。也许是我打开的方式不对，万能的 StackOverflow 上也没找到相关的解决办法，然后只好去查看代码。

处理反引号代码块的代码在 `/plugins/backtick_code_block.rb` `/plugins/pygments_code.rb` 两个文件中。两段代码都很短，其中并没有包含高亮行的处理，虽然没有注释，但是很容易看懂(论命名的重要性(〜￣ △ ￣)〜)，所以自己把这个功能加上吧。

顺带一提，_Pygments_ 支持的语言还是相当多的，看这里 ~~ [Available lexers - Pygments](http://pygments.org/docs/lexers/)

<div class="post_attention"><b>Attention: </b>不识别同时含有标题、链接等的参数。未做样式兼容。高亮背景宽度是个坑爹的固定值。以后可能会更新_(:3」∠)_</div>

### 确定格式

---

第一次改动就先不考虑太多，把处理这个行高亮的情况单独处理，也就是不能同时有标题链接等参数。格式就使用官方给出的格式。

```plain

ruby mark:#, #-#
 # some codes

```

正则表达式就是 (ruby 中的)

`/([^\s]+)\s+mark:\s?([\s0-9,-]*)/i`

通过 `$1` `$2` 分别取到代码块的语言和需要高亮的行。

渲染代码块的函数是 `/plugins/pygments_code.rb` 中的 `highlight (str, lang)`，然后里面又调用了 `tableize_code (str, lang = '')` ，要把 mark 的参数加进去，具体下面会直接上代码，很简单，已注释。

另外高亮的样式也要自己处理一下，暂时使用一个牵强的解决办法 【 (╯‵□′)╯︵┻━┻ 怎么不好好看 css

在 `/source/_includes/custom/_footer.html` 中加入处理 `highlight_line` 的样式

### 上代码

---

直接下载覆盖到指定路径 -- [给 Octopress 代码块添加高亮指定行的代码](/document/octopress_highlight_line_code.zip)

三段代码重点已高亮并注释，注意高亮样式处理可能会在一些浏览器中看不到(比如说，坑爹 IE (:3」∠))，未做兼容。

`/plugins/backtick_code_block.rb` 内容

````ruby mark: 9, 23, 25-30, 50-52
require './plugins/pygments_code'

module BacktickCodeBlock
  include HighlightCode
  AllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/i
  LangCaption = /([^\s]+)\s*(.+)?/i

  # hightlight specific line option grep
  MarkOptions = /([^\s]+)\s+mark:\s?([\s0-9,-]*)/i

  def render_code_block(input)
    @options = nil
    @caption = nil
    @lang = nil
    @url = nil
    @title = nil

    input.gsub(/^`{3} *([^\n]+)?\n(.+?)\n`{3}/m) do
      @options = $1 || ''
      str = $2

      # mark line number origin string
      @mark = nil

      if @options =~ MarkOptions
        @lang = $1

        # get origin line number string, Example: "1, 2-5" means highlight line 1 and 2,3,4,5
        @mark = $2

      elsif @options =~ AllOptions
        @lang = $1
        @caption = "<figcaption><span>#{$2}</span><a href='#{$3}'>#{$4 || 'link'}</a></figcaption>"
      elsif @options =~ LangCaption
        @lang = $1
        @caption = "<figcaption><span>#{$2}</span></figcaption>"
      end

      if str.match(/\A( {4}|\t)/)
        str = str.gsub(/^( {4}|\t)/, '')
      end
      if @lang.nil? || @lang == 'plain'
        code = tableize_code(str.gsub('<','&lt;').gsub('>','&gt;'))
        "<figure class='code'>#{@caption}#{code}</figure>"
      else
        if @lang.include? "-raw"
          raw = "``` #{@options.sub('-raw', '')}\n"
          raw += str
          raw += "\n```\n"
        elsif !@mark.nil?  #if has mark argument
          code = highlight(str, @lang, @mark)
          "<figure class='code'>#{@caption}#{code}</figure>"
        else
          code = highlight(str, @lang)
          "<figure class='code'>#{@caption}#{code}</figure>"
        end
      end
    end
  end
end

````

`/plugins/pygments_code.rb` 内容

```ruby mark: 15, 39-42, 50-54, 60-75
require 'pygments'
require 'fileutils'
require 'digest/md5'

PYGMENTS_CACHE_DIR = File.expand_path('../../.pygments-cache', __FILE__)
FileUtils.mkdir_p(PYGMENTS_CACHE_DIR)

module HighlightCode
  def highlight(str, lang, mark = nil)
    lang = 'ruby' if lang == 'ru'
    lang = 'objc' if lang == 'm'
    lang = 'perl' if lang == 'pl'
    lang = 'yaml' if lang == 'yml'
    str = pygments(str, lang).match(/<pre>(.+)<\/pre>/m)[1].to_s.gsub(/ *$/, '') #strip out divs <div class="highlight">
    tableize_code(str, lang, mark)
  end

  def pygments(code, lang)
    if defined?(PYGMENTS_CACHE_DIR)
      path = File.join(PYGMENTS_CACHE_DIR, "#{lang}-#{Digest::MD5.hexdigest(code)}.html")
      if File.exist?(path)
        highlighted_code = File.read(path)
      else
        begin
          highlighted_code = Pygments.highlight(code, :lexer => lang, :formatter => 'html', :options => {:encoding => 'utf-8', :startinline => true})
        rescue MentosError
          raise "Pygments can't parse unknown language: #{lang}."
        end
        File.open(path, 'w') {|f| f.print(highlighted_code) }
      end
    else
      highlighted_code = Pygments.highlight(code, :lexer => lang, :formatter => 'html', :options => {:encoding => 'utf-8', :startinline => true})
    end
    highlighted_code
  end
  def tableize_code (str, lang = '', mark = nil)

    # get line indexes that need to highlight
    lines = []
    if !mark.nil?
      lines = get_mark_index(mark)
    end

    table = '<div class="highlight"><table><tr><td class="gutter"><pre class="line-numbers">'
    code = ''
    str.lines.each_with_index do |line,index|
      table += "<span class='line-number'>#{index+1}</span>\n"

      # if the line needs to highlight then add a class name "highlight_line" to class attribute
      if lines[index+1] == true
        code += "<span class='line highlight_line'>#{line}</span>"
      else
        code  += "<span class='line'>#{line}</span>"
      end
    end
    table += "</pre></td><td class='code'><pre><code class='#{lang}'>#{code}</code></pre></td></tr></table></div>"
  end

  # get the line numbers that need to highlight & return the array of index
  def get_mark_index (mark)
    option = /[0-9\-]+/
    indexes = mark.scan(option)
    lines = []

    indexes.each do |index|
      if index =~ /([0-9]+)\-([0-9]+)/
        start = $1.to_i
        final = $2.to_i
        (start..final).each { |i| lines[i] = true }
      else
        lines[index.to_i] = true
      end
    end
    lines
  end

end

```

`/source/_includes/custom/footer.html` 内容

```html mark: 9-14
<p>
  Copyright &copy; {{ site.time | date: "%Y" }} - {{ site.author }} -
  <span class="credit"
    >Powered by <a href="http://octopress.org">Octopress</a></span
  >
</p>
<script type="text/javascript">
  var _bdhmProtocol =
    "https:" == document.location.protocol ? " https://" : " http://";
  document.write(
    unescape(
      "%3Cscript src='" +
        _bdhmProtocol +
        "hm.baidu.com/h.js%3F1927408f733bc1f82c711c8aece7a832' type='text/javascript'%3E%3C/script%3E"
    )
  );

  var highlight_lines = document.getElementsByClassName("highlight_line");
  for (var i = 0; i < highlight_lines.length; i++) {
    highlight_lines[i].style.paddingRight = "2000px";
    // highlight_lines[i].style.width = "100%";
    highlight_lines[i].style.backgroundColor = "rgba(80,80,80,0.5)";
  }
</script>
```
