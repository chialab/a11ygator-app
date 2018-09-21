<!DOCTYPE html>
<html lang="en">
<head>

	<meta charset="utf-8"/>
	<title>Accessibility report for "<%= data.documentTitle %>"</title>

</head>
<body>

	<style><%= data.css %></style>

	<div class="page">

		<h1>Accessibility Report For "<%= data.documentTitle %>"</h1>

		<p class="counts">
			<span class="count error"><%= data.errorCount %> errors</span>
			<span class="count warning"><%= data.warningCount %> warnings</span>
			<span class="count notice"><%= data.noticeCount %> notices</span>
		</p>

		<ul class="clean-list results-list">
			<%
			let issues = data.issues.slice(0);
			issues.sort((issue1, issue2) => parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode));
			for (let i = 0; i < issues.length; i++) { 
				let issue = issues[i]; %>
			<li class="result <%= issue.type %>" data-selector="<%= issue.selector %>">
				<h2><%= issue.type %>: <%= issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></h2>
				<p><%= issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></p>
				<pre><%= issue.context.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></pre>
			</li>
			<% } %>
		</ul>

		<hr />

		<p>Generated at: <%= data.date.toLocaleString() %></p>
	</div>

</body>
</html>