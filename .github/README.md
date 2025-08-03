
<h1 align="center">Permissionaror</h1>
<p align="center">
  🐧 <i>chmod calculator for generating Linux file permissions</i><br>
  🌐 <b><a href="https://permissionaror.as93.net">permissionaror.as93.net</a></b>
</p>

<a href="https://permissionaror.as93.net">
<p align="center">
  <img width="64" src="https://github.com/Lissy93/permissionaror/blob/main/public/logo.png?raw=true" />
  </p>
</a>

<p align="center">
 <img width="800" src="https://github.com/Lissy93/permissionaror/blob/main/public/screenshot.png?raw=true" />
  <br>
  <sup><i>A screenshot of the main calculator</i></sup>
</p>

---

### Developing

#### Prerequisites
You'll need Node.js installed, as well as Git and optionally Docker.<br>
The app is built with [Marko](https://markojs.com/), and managed with [@marko/run](https://github.com/marko-js/run) + [Vite](https://vite.dev/)

#### Setup Commands

```
git clone git@github.com:Lissy93/raid-calculator.git
cd raid-calculator
yarn
yarn dev
```

---

### Deploying

#### Option 1
Follow the developing instructions above. Then run `npm run build` to compile output<br>
You can then upload the contents of `./dist` to any web server, CDN or static host.

#### Option 2
Fork the repo, and import into Vercel, Netlify or any static hosting provider of your choice.

#### Option 3
Build the Docker image from the Dockerfile with `docker build -t raid-calculator .`<br>
And then start the container, by running `docker run -p 8080:80 raid-calculator`

---

### Contributing
Contributions are welcome.<br>
Follow the Developing instructions above to get started, and then submit your changes as a PR.<br>
If you're new to GitHub or open source, take a look at [git-in.to](https://git-in.to) for a guide on getting started.

---

<!-- License + Copyright -->
<p  align="center">
  <i>© <a href="https://aliciasykes.com">Alicia Sykes</a> 2025</i><br>
  <i>Licensed under <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17">MIT</a></i><br>
  <a href="https://github.com/lissy93"><img src="https://i.ibb.co/4KtpYxb/octocat-clean-mini.png" /></a><br>
  <sup>Thanks for visiting :)</sup>
</p>

<!-- Dinosaur -->
<!-- 
                        . - ~ ~ ~ - .
      ..     _      .-~               ~-.
     //|     \ `..~                      `.
    || |      }  }              /       \  \
(\   \\ \~^..'                 |         }  \
 \`.-~  o      /       }       |        /    \
 (__          |       /        |       /      `.
  `- - ~ ~ -._|      /_ - ~ ~ ^|      /- _      `.
              |     /          |     /     ~-.     ~- _
              |_____|          |_____|         ~ - . _ _~_-_
-->



