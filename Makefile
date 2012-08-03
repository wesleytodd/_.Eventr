REPORTER = spec
test:
	@../node_modules/.bin/mocha --globals match --require should --reporter $(REPORTER)

lib-cov: clean
	@mkdir -p test/lib && cp eventr.js test/lib/
	@jscoverage test/lib test/coverage
	@chmod -R 755 test/coverage

test-cov: lib-cov
	@EVENTR_COV=1 $(MAKE) -s test REPORTER=html-cov > test/coverage.html

clean:
	@rm -rf test/lib test/coverage test/coverage.html

.PHONY: test lib-cov test-cov clean
