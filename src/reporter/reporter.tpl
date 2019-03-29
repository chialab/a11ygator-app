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

            <div class="report-title-container">
			    <h1>Accessibility report for <a href="<%= data.pageUrl %>" target="_blank"><%= data.documentTitle %></a></h1>
                <a class="download-report" aria-label="download report" href="data:text/json;charset=utf-8,<%= encodeURIComponent(JSON.stringify(data)) %>" download="report.json">Download</a>
            </div>

			<% if (data.screenPath) { %>
			<div class="screenshot-container">
				<div class="buttons-container">
					<div class="button-osx close"></div>
					<div class="button-osx minimize"></div>
					<div class="button-osx zoom"></div>
				</div>
				<img alt="a screenshot of the tested web page" class="screenshot" src="<%= data.screenPath %>"/>
			</div>
			<% } %>

			<ul class="results-list">
				<%
				var issues = data.issues
					.slice(0)
					.sort((issue1, issue2) => {
						if (issue1.typeCode !== issue2.typeCode) {
							return parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode);
						}
						return 0;
					});

                if (!issues.length) { %>
                     <h1>🎉Hurray! I have found no problems with your website. Now you are ready for a <b>real</b> accessibility test by human beings!</h1>
                <% }

				for (let i = 0; i < issues.length; i++) {
					let issue = issues[i]; %>
				<li class="result <%= issue.type %>" data-selector="<%= issue.selector %>">
					<h2 class="issue-title"><%= issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></h2>
					<p class="issue-rule"><%= issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></p>
					<pre class="issue-code"><code><%= (issue.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') %></code></pre>
				</li>
				<% } %>
			</ul>
			<hr />

			<footer>
				<p>Generated at: <%= data.date.toLocaleString() %></p>
				<p class="credits">Powered by <a href="http://pa11y.org/" target="_blank"><img src="http://pa11y.org/resources/brand/logo.svg" alt="Pa11y logo" />Pa11y</a></p>
			</footer>
		</div>
	</div>
</body>
</html>
