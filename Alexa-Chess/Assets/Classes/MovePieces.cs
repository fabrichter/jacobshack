using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using FenParser;
using System.Net;
using System.IO;
using System.ComponentModel;

public class MovePieces : MonoBehaviour {

    System.Net.WebRequest web;
    private string id = "jacobsHack";
    bool parsing = true;
    BackgroundWorker NetThread;
    string fen = "";

    Vector3 getPosition(int y, int x)
    {
        float newx = x + 1.38f;
        float newy = 0.0f;
        float newz = 8 - y;
        return new Vector3(newx, newy, newz); 
    }

    GameObject[] WPawns;
    GameObject[] BPawns;
    GameObject[] WTower;
    GameObject[] BTower;
    GameObject[] WHorse;
    GameObject[] BHorse;
    GameObject[] WBishop;
    GameObject[] BBishop;
    GameObject[] WQueen;
    GameObject[] BQueen;
    GameObject[] WKing;
    GameObject[] BKing;
    //Dictionary<string, GameObject> dict;

    // Use this for initialization
    void Start()
    {
        WQueen = GameObject.FindGameObjectsWithTag("WQueen");
        WKing = GameObject.FindGameObjectsWithTag("WKing");
        WTower = GameObject.FindGameObjectsWithTag("WTower");
        WBishop = GameObject.FindGameObjectsWithTag("WBishop");
        WPawns = GameObject.FindGameObjectsWithTag("WPawn");
        WHorse = GameObject.FindGameObjectsWithTag("WHorse");
        BQueen = GameObject.FindGameObjectsWithTag("BQueen");
        BKing = GameObject.FindGameObjectsWithTag("BKing");
        BTower = GameObject.FindGameObjectsWithTag("BTower");
        BBishop = GameObject.FindGameObjectsWithTag("BBishop");
        BPawns = GameObject.FindGameObjectsWithTag("BPawn");
        BHorse = GameObject.FindGameObjectsWithTag("BHorse");

        NetThread = new BackgroundWorker();
        NetThread.DoWork += WebFetch;
        NetThread.RunWorkerCompleted += FetchDone;
        NetThread.RunWorkerAsync();
    }

	// Update is called once per frame
	void Update () {

        if (fen != ""){
            updatePositions();
        }
	    
	}

    void updatePositions()
    {
        int indBPawn = 0;
        int indWPawn = 0;
        int indBTower = 0;
        int indWTower = 0;
        int indBHorse = 0;
        int indWHorse = 0;
        int indBBshop = 0;
        int indWBshop = 0;
        int indWKing = 0;
        int indBKing = 0;
        int indWQueen = 0;
        int indBQueen = 0;
        FenParser.FenParser parser = new FenParser.FenParser(fen);
        string[][] test = parser.BoardStateData.Ranks;
        for (int i = 0; i < test.Length; i++)
        {
            for (int j = 0; j < test.Length; j++)
            {
                switch (test[i][j])
                {
                    case "P":
                        {
                            WPawns[indWPawn++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "p":
                        {
                            BPawns[indBPawn++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "R":
                        {
                            WTower[indWTower++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "r":
                        {
                            BTower[indBTower++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "n":
                        {
                            BHorse[indBHorse++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "N":
                        {
                            WHorse[indWHorse++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "b":
                        {
                            BBishop[indBBshop++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "B":
                        {
                            WBishop[indWBshop++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "k":
                        {
                            BKing[indBKing++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "K":
                        {
                            WKing[indWKing++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "q":
                        {
                            BQueen[indBQueen++].transform.position = getPosition(i, j);
                            break;
                        }
                    case "Q":
                        {
                            WQueen[indWQueen++].transform.position = getPosition(i, j);
                            break;
                        }
                }
            }
        }
        for (int i = indWPawn; i < WPawns.Length; i++) Destroy(WPawns[i]);
        for (int i = indBPawn; i < BPawns.Length; i++) Destroy(BPawns[i]);
        for (int i = indWTower; i < WTower.Length; i++) Destroy(WTower[i]);
        for (int i = indBTower; i < BTower.Length; i++) Destroy(BTower[i]);
        for (int i = indWHorse; i < WHorse.Length; i++) Destroy(WHorse[i]);
        for (int i = indBHorse; i < BHorse.Length; i++) Destroy(BHorse[i]);
        for (int i = indWBshop; i < WBishop.Length; i++) Destroy(WBishop[i]);
        for (int i = indBBshop; i < BBishop.Length; i++) Destroy(BBishop[i]);
        for (int i = indWKing; i < WKing.Length; i++) Destroy(WKing[i]);
        for (int i = indBKing; i < BKing.Length; i++) Destroy(BKing[i]);
        for (int i = indBQueen; i < BQueen.Length; i++) Destroy(BQueen[i]);
        for (int i = indWQueen; i < WQueen.Length; i++) Destroy(WQueen[i]);
        parsing = true;
        fen = "";
    }

    private void WebFetch(object sender, EventArgs Args)
    {

        WebRequest Req = System.Net.WebRequest.Create("http://node-express-env.yppentce29.eu-west-1.elasticbeanstalk.com/game/" + id);
        try
        {
            WebResponse Res = Req.GetResponse();
            StreamReader Reader = new StreamReader(Res.GetResponseStream());
            fen = Reader.ReadToEnd();
            Reader.Close();
        } catch { }
        System.Threading.Thread.Sleep(1000);

    }

    private void FetchDone(object sender, EventArgs Args)
    {

        NetThread.RunWorkerAsync();

    }
}
