# Развёртывание storage.secretkeeper.net

Инструкция для администраторов: что нужно от виртуалки и как на ней
поднять и обновлять сервер облачной копии Secret Keeper. Общее описание
сервера и протокола - в `README.md`.

Сервер - один процесс Node в Docker, без нативных модулей и без базы
данных. Он хранит файлы, которые приложение уже зашифровало на устройстве
пользователя: на сервере только шифротекст, ключей нет. Поэтому к VM нет
требований по изоляции данных сверх обычных, а бэкап `data/` - это бэкап
обычных файлов.

## 1. Что нужно

| | |
|---|---|
| ОС | Linux x86_64 или arm64 (Debian/Ubuntu проверены), Docker + плагин compose (`docker compose version` 2.20+) |
| CPU / RAM | 1 vCPU, 1-2 GB достаточно: процесс не держит данные в памяти, тела запросов идут потоком на диск |
| Диск | Системный маленький. Каталог с данными (`data/`, `data-test/`) - на **отдельном блочном томе, который можно расширять без переезда**. Старт 100 GB. Квота по умолчанию 1 GiB на пользователя, но реально архив без вложений - килобайты-мегабайты |
| Сеть | DNS A/AAAA `storage.secretkeeper.net` и `storage-test.secretkeeper.net` на VM. Наружу открыты только 80/443; контейнеры слушают `127.0.0.1:4323` и `127.0.0.1:4324` |
| TLS | nginx + Let's Encrypt (`certbot --nginx`). Конфиг - `nginx.conf.example` и сниппет `nginx_proxy.conf.example` |
| Время | **NTP обязателен** (`timedatectl` → `System clock synchronized: yes`). Каждый запрос подписан с меткой времени клиента, сервер принимает расхождение не больше 5 минут: ушедшие часы сервера отрубают всех пользователей сразу |
| Git | Доступ к `https://hubble.molot.ru/lashin/secret_keeper_storage` (внутренний GitLab, зеркало публичного [github.com/Paymaster-Technologies/sk-storage](https://github.com/Paymaster-Technologies/sk-storage)) - для клона и webhook. Репозиторий приватный: deploy-ключ или пользователь сборщика, как у сайтов |

## 2. Первый запуск

```sh
sudo mkdir -p /srv && cd /srv
sudo git clone https://hubble.molot.ru/lashin/secret_keeper_storage.git sk_storage
cd sk_storage

# Данные - на отдельном томе; каталоги должны принадлежать uid 1000
# (внутри контейнера процесс работает от пользователя node).
sudo mkdir -p /mnt/sk_data/data /mnt/sk_data/data-test
sudo chown 1000:1000 /mnt/sk_data/data /mnt/sk_data/data-test
sudo ln -s /mnt/sk_data/data data
sudo ln -s /mnt/sk_data/data-test data-test

sudo cp .env.example .env            # прод: значения по умолчанию, править не нужно
sudo cp .env.test.example .env.test  # тест: MAX_STORAGE_IDS=1, квота 64 MiB

sudo docker compose --profile test build
sudo docker compose --profile test up -d
curl -s http://127.0.0.1:4323/healthz; echo
curl -s http://127.0.0.1:4324/healthz; echo
```

Ожидаемый ответ обоих `healthz` - `{"ok":true,"time":…}`.

Переменные `.env` (прод) оставить по умолчанию: `QUOTA_BYTES=1GiB`,
`MAX_OBJECT_BYTES=512MiB`, `SKEW_MS=300000`, `MAX_STORAGE_IDS=0`
(без ограничения числа пользователей). Полный список - таблица в `README.md`.

## 3. nginx

```sh
sudo cp nginx_proxy.conf.example /etc/nginx/snippets/sk_storage_proxy.conf
sudo cp nginx.conf.example /etc/nginx/sites-available/storage.secretkeeper.net
sudo ln -s /etc/nginx/sites-available/storage.secretkeeper.net /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d storage.secretkeeper.net -d storage-test.secretkeeper.net
```

В конфиге важны три вещи, они уже выставлены: `client_max_body_size 512m`
(вложения Сейфа уходят одним PUT), `proxy_request_buffering off`
(сервер хеширует тело на лету и проверяет подпись до того, как сделать
объект видимым) и таймауты 600 с (большая загрузка с телефона идёт
минутами). Заголовки `X-SK-*` nginx пропускает как есть, ничего
дополнительно настраивать не надо.

Проверка снаружи:

```sh
curl -s https://storage.secretkeeper.net/healthz; echo
curl -s https://storage-test.secretkeeper.net/healthz; echo
curl -sI https://storage.secretkeeper.net/ | head -1     # 200, страница для людей
```

## 4. Обновление

Скрипт `deploy_vm.sh` в корне репо: `git fetch` + fast-forward, сборка
образа, перезапуск, проверка `healthz`. Сборка идёт до перезапуска: если
она упала, старый контейнер продолжает работать.

```sh
cd /srv/sk_storage && sudo WITH_TEST=1 ./deploy_vm.sh
```

Webhook: на репозиторий `lashin/secret_keeper_storage` во внутреннем
GitLab повесить push-hook на ветку `main`, который выполняет эту команду
на VM, как у сайтов (secretkeeper.net и остальных). Ручной запуск той же
командой - на случай, если хук не отработал.

`.env`, `.env.test`, `data/`, `data-test/` скрипт не трогает.

## 5. Эксплуатация

- **Бэкап**: `data/` (прод). Это обычные файлы, содержимое - шифротекст,
  расшифровать его может только владелец своей seed-фразой. Достаточно
  ежедневного снимка тома или `rsync` в другое место. `data-test/`
  бэкапить не нужно.
- **Мониторинг**: `GET /healthz` на обоих хостах, место на томе с данными,
  `timedatectl` (синхронизация времени).
- **Логи**: `docker compose logs -f storage` (ротация настроена в compose:
  3 файла по 10 MB). Пишутся только загрузки (`put <id>… <размер>B`),
  полные очистки и ошибки сервера; тел, ключей и адресов клиентов в логах
  нет.
- **Место кончилось**: расширить том, сервер сам ничего не чистит.
  Квота на пользователя (`QUOTA_BYTES`) меняется в `.env` с перезапуском
  (`docker compose up -d`).
- **Диагностика**: `docker compose ps`, `docker compose logs --tail 100 storage`.
  Если у пользователей массово «сервер отклонил запрос» (`401
  auth-clock-skew`) - сверить `date -u` на VM с `time` из `/healthz` и с
  реальным временем, проверить NTP.

## 6. Что отдать команде после запуска

Подтверждение, что `https://storage.secretkeeper.net/healthz` и
`https://storage-test.secretkeeper.net/healthz` отвечают снаружи, и что
webhook развёртывает пуш в `main`. Дальнейшие проверки (подписанные
запросы, большие загрузки, синхронизация приложения) команда делает сама.
