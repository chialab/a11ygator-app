<!DOCTYPE html>
<html lang="en">
<head>

	<meta charset="utf-8"/>
	<title>Accessibility Report For "<%= documentTitle %>"</title>

	<style><%= css %></style>

</head>
<body>

	<div class="page">

		<h1>Accessibility Report For "<%= documentTitle %>"</h1>
		<p>Generated at: <%= date %></p>

		<p class="counts">
			<span class="count error"><%= errorCount %> errors</span>
			<span class="count warning"><%= warningCount %> warnings</span>
			<span class="count notice"><%= noticeCount %> notices</span>
		</p>

		<ul class="clean-list results-list">
			<% for (issue in issues) { %>
			<li class="result <%= issue.type %>">
				<h2><%= issue.typeLabek %>: <%= issue.message %></h2>
				<p><%= issue.code %></p>
				<pre><%= issue.context %> (select with "<%= issue.selector %>")</pre>
			</li>
			<% } %>
		</ul>

	</div>

</body>
</html>