<!DOCTYPE html>
<html lang="en">
<head>

	<meta charset="utf-8"/>
	<title>Accessibility report for "<%= data.documentTitle %>"</title>

</head>
<body>

	<div class="pa11y-report">
		<style><%= data.css %></style>

		<div class="pa11y-page">

			<h1>Accessibility report for <a href="<%= data.pageUrl %>" target="_blank"><%= data.documentTitle %></a></h1>

			<% if (data.screenPath) { %>
			<div class="screenshot-container">
				<div class="buttons-container">
					<div class="button-osx close"></div>
					<div class="button-osx minimize"></div>
					<div class="button-osx zoom"></div>
				</div>
				<img class="screenshot" src="<%= data.screenPath %>"/>
			</div>
			<% } %>

			<form>
				<input type="radio" id="radio-all" value="all" name="filter" checked />
				<label for="radio-all" class="all">All</label>
				<input type="radio" id="radio-errors" value="errors" name="filter" />
				<label for="radio-errors" class="count-error">Errors (<%= data.errorCount %>)</label>
				<input type="radio" id="radio-warnings" value="warnings" name="filter" />
				<label for="radio-warnings" class="count-warning">Warnings (<%= data.warningCount %>)</label>
				<input type="radio" id="radio-notices" value="notices" name="filter" />
				<label for="radio-notices" class="count-notice">Notices (<%= data.noticeCount %>)</label>

				<output>
					<ul class="clean-list results-list">
						<%
						let issues = data.issues.slice(0);
						issues.sort((issue1, issue2) => parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode));
						for (let i = 0; i < issues.length; i++) { 
							let issue = issues[i]; %>
						<li class="result <%= issue.type %>" data-selector="<%= issue.selector %>">
							<h2 class="issue-title"><%= issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></h2>
							<p class="issue-rule"><%= issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></p>
							<pre class="issue-code"><code><%= (issue.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') %></code></pre>
						</li>
						<% } %>
					</ul>
				</output>
			</form>

			<hr />

			<footer>
				<p>Generated at: <%= data.date.toLocaleString() %></p>
				<p class="credits">Powered by <a href="http://pa11y.org/" target="_blank"><img src="http://pa11y.org/resources/brand/logo.svg" alt="Pa11y logo" />Pa11y</a></p>
			</footer>
		</div>
	</div>
</body>
</html>