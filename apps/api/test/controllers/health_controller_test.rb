class HealthControllerTest < ActionDispatch::IntegrationTest
  test "health returns status 'ok'" do
    get "/health"

    assert_equal "ok", response.parsed_body["status"]
    assert_equal({ "status" => "ok" }, response.parsed_body)
  end

  test "health origem=monitor return status 'ok'" do
    get "/health?origem=monitor"

    assert_equal "ok", response.parsed_body["status"]
    assert_equal({ "status" => "ok" }, response.parsed_body)
  end

  test "method nonexistent health" do
    post "/health"

    assert_equal 405, response.status
    assert_equal "GET", response["allow"]
    assert_equal "application/json; charset=utf-8", response["content-type"]
  end

  test "endpoint nonexistent health" do
    get "/health/anything"

    assert_equal 404, response.status
  end
end
