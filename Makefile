test:
	@node node_modules/lab/bin/lab --ignore Reflect
test-cov:
	@node node_modules/lab/bin/lab -vcL --ignore Reflect
test-cov-lcov:
	@node node_modules/lab/bin/lab -cL -r lcov -o coverage.lcov --ignore Reflect
test-cov-html:
	@node node_modules/lab/bin/lab -r html -o coverage.html --ignore Reflect

.PHONY: test test-cov test-cov-lcov test-cov-html
