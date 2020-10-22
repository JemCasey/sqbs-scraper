import express from "express";
import { join } from "path";
import { getConnection } from './db';
import PlayerService from './services/PlayerService';

const app = express();
const port = process.env.PORT || "5555";
const connection = getConnection();
const playerService = new PlayerService(connection);

app.set("views", join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(join(__dirname, "public")));

app.get("/", (_, res) => {
  res.render("index", { title: "Home" });
});

app.get("/player", async (_, res) => {
  res.json({
    ...(await playerService.getRandomUnmatchedPlayer())
  })
});

app.post("/merge/:mergeFrom/:mergeTo", async (req, res) => {
  res.json({
    ...(await playerService.mergePlayersByIds(req.params.mergeFrom, req.params.mergeTo))
  })
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

