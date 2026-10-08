/**
 * Flames along the bottom edge of the footer. Decorative only.
 *
 * Three layers of hand-shaped tongues (generated once from a seeded script, then frozen here so the
 * silhouettes never change between builds): dark red at the back, orange in the middle, a short
 * gold-orange core in front. Colour is keyed to height above the ground in user space, not to each
 * tongue, so every flame cools toward its tip the way real fire does. Crisp vector edges on purpose:
 * no blur filters, no glow blobs. The flicker is CSS (flame.css) and switches off for reduced motion.
 *
 * Each entry: [path, flicker seconds, flicker delay seconds].
 */
const BACK = [
  ['M-146 370C-171 337 -102 310 -82 288C-68 308 62 335 34 370Z', 6.1, -0.5],
  ['M29 370C6 329 70 295 85 266C97 293 223 327 196 370Z', 6.4, -7.4],
  ['M135 370C109 318 187 271 262 232C301 268 354 315 324 370Z', 6.2, -8.8],
  ['M281 370C255 264 330 177 339 90C365 155 380 188 388 242C403 253 432 227 451 216C480 270 489 308 467 370Z', 4.9, -5.1],
  ['M439 370C411 311 492 256 544 211C574 253 671 308 639 370Z', 6.7, -4.8],
  ['M630 370C602 319 599 289 636 243C659 251 689 285 703 276C708 234 687 200 733 149C757 204 894 277 861 370Z', 7.0, -4.7],
  ['M814 370C789 267 871 182 954 97C997 161 950 200 957 253C972 264 985 245 1003 234C1033 272 1021 309 999 370Z', 8.7, -3.8],
  ['M974 370C949 316 1024 267 1088 226C1122 264 1188 313 1159 370Z', 6.0, -3.2],
  ['M1096 370C1077 316 1068 283 1093 253C1109 263 1124 269 1133 259C1137 223 1106 186 1138 130C1146 191 1277 269 1255 370Z', 7.4, -8.9],
  ['M1275 370C1252 325 1319 287 1369 254C1397 285 1467 323 1440 370Z', 6.5, -1.5],
  ['M1351 370C1325 338 1397 313 1422 292C1440 311 1569 337 1539 370Z', 6.2, -7.8],
];

const MID = [
  ['M-119 370C-134 341 -89 319 -46 301C-24 318 5 340 -12 370Z', 8.4, -2.5],
  ['M-7 370C-24 339 28 315 79 295C106 314 139 338 119 370Z', 5.2, -2.1],
  ['M89 370C73 330 118 297 133 269C144 295 222 328 204 370Z', 6.3, -3.3],
  ['M200 370C181 301 235 237 269 183C289 233 358 297 336 370Z', 7.5, -0.5],
  ['M316 370C296 301 359 247 411 192C442 233 417 256 423 290C434 297 447 281 462 275C485 304 480 328 462 370Z', 6.2, -1.7],
  ['M450 370C439 337 440 320 455 295C464 300 478 309 484 304C486 287 484 267 502 237C515 270 555 312 542 370Z', 7.2, -0.6],
  ['M490 370C473 322 524 280 579 244C607 277 631 320 611 370Z', 6.6, -1.0],
  ['M603 370C584 279 638 206 652 132C673 187 677 219 682 265C693 274 712 242 725 233C746 284 750 316 735 370Z', 7.6, -4.6],
  ['M691 370C674 286 725 205 769 137C793 200 834 281 814 370Z', 7.9, -2.7],
  ['M817 370C799 333 850 303 882 278C900 302 964 332 944 370Z', 6.0, -2.0],
  ['M914 370C896 317 947 270 983 230C1004 267 1058 315 1038 370Z', 7.9, -1.8],
  ['M994 370C976 324 1026 285 1041 251C1052 282 1145 322 1124 370Z', 7.8, -8.9],
  ['M1146 370C1133 324 1173 290 1200 256C1218 282 1208 297 1211 318C1219 323 1229 303 1238 299C1254 326 1252 341 1241 370Z', 5.4, -2.0],
  ['M1203 370C1187 338 1234 313 1280 292C1303 312 1333 337 1315 370Z', 6.6, -5.9],
  ['M1342 370C1326 346 1372 330 1415 316C1438 329 1469 345 1452 370Z', 7.9, -4.3],
  ['M1411 370C1397 332 1438 300 1477 273C1498 298 1527 330 1511 370Z', 6.2, -3.6],
];

const CORE = [
  ['M-49 370C-57 350 -35 337 -31 327C-28 337 17 349 8 370Z', 8.6, -7.3],
  ['M-22 370C-34 347 0 332 25 319C39 331 77 347 63 370Z', 6.9, -1.2],
  ['M51 370C40 342 72 321 92 303C103 319 143 341 130 370Z', 6.4, -7.8],
  ['M173 370C165 352 188 342 197 333C203 341 241 352 231 370Z', 7.1, -2.3],
  ['M221 370C210 353 241 343 256 335C266 343 312 352 300 370Z', 7.1, -8.1],
  ['M297 370C286 335 318 307 338 283C349 305 389 333 376 370Z', 4.5, -4.0],
  ['M365 370C354 353 383 344 393 337C400 344 451 353 439 370Z', 7.7, -5.0],
  ['M447 370C436 343 467 322 494 305C509 321 534 341 522 370Z', 7.0, -2.2],
  ['M519 370C508 335 540 307 561 283C573 305 610 334 598 370Z', 8.6, -4.0],
  ['M612 370C601 342 632 320 656 303C669 319 698 341 686 370Z', 6.9, -4.3],
  ['M694 370C681 337 719 310 757 287C777 308 800 335 785 370Z', 7.0, -8.5],
  ['M783 370C776 350 798 338 809 328C816 337 847 350 839 370Z', 5.5, -0.7],
  ['M833 370C819 335 855 306 865 282C872 305 941 333 926 370Z', 7.4, -1.3],
  ['M929 370C919 331 950 298 985 271C1004 296 1012 329 1000 370Z', 6.6, -8.9],
  ['M1006 370C997 351 1023 339 1039 330C1048 339 1081 350 1071 370Z', 5.3, -2.9],
  ['M1076 370C1067 354 1094 345 1108 338C1117 345 1154 353 1143 370Z', 5.9, -5.6],
  ['M1137 370C1125 354 1158 345 1184 338C1198 345 1229 353 1216 370Z', 4.9, -2.4],
  ['M1199 370C1190 342 1215 320 1218 302C1222 319 1275 340 1265 370Z', 8.6, -7.4],
  ['M1279 370C1268 354 1299 346 1319 339C1331 346 1368 354 1356 370Z', 4.8, -0.5],
  ['M1386 370C1379 353 1401 343 1424 334C1436 342 1447 352 1438 370Z', 8.1, -0.8],
  ['M1459 370C1449 357 1478 352 1495 348C1504 352 1544 357 1532 370Z', 6.9, -8.3],
];

function Layer({ tongues, fill }) {
  return (
    <g fill={fill}>
      {tongues.map(([path, duration, delay], index) => (
        <path key={index} d={path} className="footer-flames__tongue" style={{ '--t': `${duration}s`, '--d': `${delay}s` }} />
      ))}
    </g>
  );
}

export default function FooterFlames() {
  return (
    <svg className="footer-flames" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ff-back" gradientUnits="userSpaceOnUse" x1="0" y1="366" x2="0" y2="20">
          <stop offset="0" stopColor="#b8321f" stopOpacity="0.92" />
          <stop offset="0.5" stopColor="#7a2218" stopOpacity="0.6" />
          <stop offset="1" stopColor="#4a1710" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ff-mid" gradientUnits="userSpaceOnUse" x1="0" y1="366" x2="0" y2="110">
          <stop offset="0" stopColor="#f26b2c" />
          <stop offset="0.42" stopColor="#d93a26" stopOpacity="0.92" />
          <stop offset="1" stopColor="#b8321f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ff-core" gradientUnits="userSpaceOnUse" x1="0" y1="366" x2="0" y2="215">
          <stop offset="0" stopColor="#f9a73e" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#f2762e" stopOpacity="0.7" />
          <stop offset="1" stopColor="#e5502a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Layer tongues={BACK} fill="url(#ff-back)" />
      <Layer tongues={MID} fill="url(#ff-mid)" />
      <Layer tongues={CORE} fill="url(#ff-core)" />
    </svg>
  );
}
