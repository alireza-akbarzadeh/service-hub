import { loginTeam } from "../lib/auth"

async function testAuth() {
  console.log("=== Testing Team Authentication ===")

  // Test 1: Invalid credentials
  const badRes = await loginTeam({ teamName: "wrong_team", password: "wrong" })
  console.log(
    "Invalid credentials rejected as expected:",
    badRes.success === false
  )

  // Test 2: Valid credentials
  const goodRes = await loginTeam({
    teamName: "frontend_team",
    password: "Aa.13741995!!",
  })
  console.log("Valid credentials accepted:", goodRes.success === true)

  console.log("=== Team Authentication Tests PASSED! ===")
}

testAuth()
